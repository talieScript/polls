import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { PrismaClient, FindOneVoterArgs } from '@prisma/client';
import { EmailService } from 'src/email/email.service';
import { PollsService } from '../polls/polls.service';
import { v4 as uuidv4 } from 'uuid';
import { VoteStatusRes } from '../polls/interfaces/voteStatusResponce.interface'

const prisma = new PrismaClient();

@Injectable()
export class VoterService {
    constructor(
        @Inject(forwardRef(() => EmailService))
        private readonly emailService: EmailService,
        @Inject(forwardRef(() => PollsService))
        private readonly pollService: PollsService,
    ) {}

    async voterValidationNoEmail({ipAddress, answers, pollId}): Promise<VoteStatusRes> {
        const pollVoters: {voters: string[]} = await prisma.poll.findOne({
            where: {id: pollId},
            select: { voters: true },
        });

        const votersWithIp = await prisma.voter.findMany({
            where: {ip: ipAddress},
        });

        // checks if voter has already voted on poll
        const pollVoterId = pollVoters.voters.find(pollVoter => {
            return votersWithIp.some(voter => voter.id === pollVoter);
        });

        if (pollVoterId) {
            return {
                voterId: pollVoterId,
                voteStatus: 'alreadyVoted'
            };
        }

        const newVoter = await prisma.voter.create({
            data: {
                id: uuidv4(),
                ip: ipAddress,
                Answers: {
                    set: answers.map(answerId => answerId),
                },
            },
        });

        await prisma.poll.update({
            data: {
                voters: { set: [...pollVoters.voters, newVoter.id] },
            },
            where: { id: pollId },
        });

        await this.pollService.castVote({
            voterId: newVoter.id,
            answers,
        });

        return {
            voterId: newVoter.id,
            voteStatus: 'votePassed'
        };
    }

    async voterValidationWithEmail({email, ipAddress, answers, pollId}): Promise<VoteStatusRes> {
        const pollVoters: {voters: string[]} = await prisma.poll.findOne({
            where: {id: pollId},
            select: { voters: true },
        }) as {voters: string[]};

        const currentVoter = await prisma.voter.findOne({
            where: {email},
        });

        const voterIds: string[]  = pollVoters.voters;

        if (voterIds.some(voter => voter ===  currentVoter.id)) {
            return {
                voterId: currentVoter.id,
                voteStatus: 'alreadyVoted'
            }
        }

        // If no record of voter with that email then send email confirmation email.
        if (!currentVoter) {
            const pendingEmail = await prisma.pendingEmail.findOne({
                where: {email},
            });
            // if this voter has already voted and the email is awaiting validation
            if (pendingEmail) {
                return {
                    voterId: '',
                    voteStatus: 'emailPending'
                };
            }

            // send email and check its been sent
            await this.emailService.sendValidationEmail(email).catch(() => {
                return {
                    voterId: '',
                    voteStatus: 'emailError'
                };
            });

            await prisma.pendingEmail.create({
                data: {
                    email,
                    answers: { set: answers },
                    ip: ipAddress,
                },
            });

            return {
                voterId: '',
                voteStatus: 'emailSent'
            };
        }

        await this.pollService.castVote({
            voterId: currentVoter.id,
            answers,
        });

        return {
            voterId: currentVoter.id,
            voteStatus: 'votePassed'
        }

    }

    createVoterWithEamil({email, ip, answers}) {
        return prisma.voter.create({
            data: {
                id: uuidv4(),
                ip,
                Answers: { set: answers.map(answerId => answerId) },
                email,
            },
        });
    }

    async getVoter(findOptions: FindOneVoterArgs) {
        return await prisma.voter.findOne(findOptions);
    }

}
