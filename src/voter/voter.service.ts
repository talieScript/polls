import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { PrismaClient, FindOnevoterArgs } from '@prisma/client';
import { EmailService } from 'src/email/email.service';
import { PollsService } from '../polls/polls.service';

const prisma = new PrismaClient();

@Injectable()
export class VoterService {
    constructor(
        @Inject(forwardRef(() => EmailService))
        private readonly emailService: EmailService,
        @Inject(forwardRef(() => PollsService))
        private readonly pollService: PollsService,
    ) {}

    async voterValidationNoEmail({ipAddress, answers, pollId}): Promise<{voterId: string, message: string, validVote: boolean}> {
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
                message: 'Validation failed; has already voted on poll.',
                validVote: false,
            };
        }

        const newVoter = await prisma.voter.create({
            data: {
                ip: ipAddress,
                answers: { set: answers },
            },
        });

        await prisma.poll.update({
            data: {
                voters: { set: [...pollVoters.voters, newVoter.id] },
            },
            where: { id: pollId },
        });

        return {
            voterId: newVoter.id,
            message: 'Validation passed; Created new voter in database.',
            validVote: true,
        };
    }

    async voterValidationWithEmail({email, ipAddress, answers, pollId}): Promise<{voterId: string, message: string, validVote: boolean}> {
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
                message: 'Validation failed; Voter already voted on poll.',
                validVote: false,
            }
        }

        // If no record of voter with that email then send email confirmation email.
        if (!currentVoter) {
            const pendingEmail = await prisma.pendingemail.findOne({
                where: {email},
            });
            // if this voter has already voted and the email is awaiting validation
            if (pendingEmail) {
                return {
                    voterId: '',
                    message: 'Email pending verification.',
                    validVote: false,
                };
            }
            await prisma.pendingemail.create({
                data: {
                    email,
                    answers: { set: answers },
                    ip: ipAddress,
                },
            });

            this.emailService.sendValidationEmail(email);

            return {
                voterId: '',
                message: 'Validation passed; Varification email sent.',
                validVote: false,
            };
        }

        await this.pollService.castVote({
            voterId: currentVoter.id,
            answers,
        });

        return {
            voterId: currentVoter.id,
            message: 'Voter found; Vote has been cast.',
            validVote: true,
        }

    }

    createVoterWithEamil({email, ip, answers}) {
        return prisma.voter.create({
            data: {
                ip,
                answers: { set: answers },
                email,
            },
        });
    }

    async getVoter(findOptions: FindOnevoterArgs) {
        return await prisma.voter.findOne(findOptions);
    }

}
