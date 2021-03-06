import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { EmailService } from 'src/email/email.service';
import { PollsService } from '../polls/polls.service';
import { v4 as uuidv4 } from 'uuid';
import { VoteStatusRes } from '../polls/interfaces/voteStatusResponce.interface'
import { generate } from '../utils/passwordHashing'

const prisma = new PrismaClient();

interface VoteValidationRrturn extends VoteStatusRes {
    passed: boolean
}

@Injectable()
export class VoterService {
    constructor(
        @Inject(forwardRef(() => EmailService))
        private readonly emailService: EmailService,
        @Inject(forwardRef(() => PollsService))
        private readonly pollService: PollsService,
    ) {}

    async voterValidationWithIp({ipAddress, answers, pollId}): Promise<VoteValidationRrturn> {
        const pollVoters: {voters: string[]} = await prisma.poll.findUnique({
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
                voteStatus: 'alreadyVoted',
                passed: false,
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
            voteStatus: 'votePassed',
            passed: true
        };
    }

    async voterValidationWithEmail({email, ipAddress, answers, pollId, user}): Promise<VoteValidationRrturn> {
        const pollVoters: {voters: string[]} = await prisma.poll.findUnique({
            where: {id: pollId},
            select: { voters: true },
        }) as {voters: string[]};

        const currentVoter = await prisma.voter.findUnique({
            where: {email: user?.email || email},
        });

        const voterIds: string[]  = pollVoters.voters;

        if (currentVoter && voterIds.some(voter => voter ===  currentVoter.id)) {
            return {
                voterId: currentVoter.id,
                voteStatus: 'alreadyVoted',
                passed: false
            }
        }

        // If no record of voter with that email or asked by the frontend to validate then send email confirmation email.
        if (!currentVoter || !user) {
            const pendingEmail = await prisma.pendingEmail.findUnique({
                where: {email: user?.email || email},
            });
            // if this voter has already voted and the email is awaiting validation
            if (pendingEmail) {
                return {
                    voterId: '',
                    voteStatus: 'emailPending',
                    passed: false
                };
            }

            // send email and check its been sent
            await this.emailService.sendValidationEmail({email, pollId, answers}).catch(() => {
                return {
                    voterId: '',
                    voteStatus: 'emailError',
                    passed: false
                }
            });

            await prisma.pendingEmail.create({
                data: {
                    email: user?.email || email,
                    answers: { set: answers },
                    ip: ipAddress,
                    pollId,
                },
            });

            return {
                voterId: '',
                voteStatus: 'emailSent',
                passed: false
            };
        }

        await this.pollService.castVote({
            voterId: currentVoter.id,
            answers,
        });

        return {
            voterId: currentVoter.id,
            voteStatus: 'votePassed',
            passed: true
        }

    }

    createVoterWithEamil({email, ip = '', answers = []}) {
        return prisma.voter.create({
            data: {
                id: uuidv4(),
                ip,
                Answers: { set: answers.map(answerId => answerId) },
                email,
            },
        });
    }

    async getVoter(findOptions) {
        return await prisma.voter.findUnique(findOptions);
    }

    async getAnswersForPoll({voterEmail, voterIp, pollId}) {
        const poll = await this.pollService.findOne(pollId, {options: true, voters: true});
        const pollOptions = JSON.parse(poll.options)

        // get poll answers
        const pollAnswers = await this.pollService.getAnswers(pollId);
        debugger;
        let voter;
        if (pollOptions.validateIp) {
            // if poll requires ip validation then get the user form the ip and ignore the email
            voter = await prisma.voter.findMany({
                where: {
                    ip: voterIp,
                    id: { in: poll.voters }
                },
                select: { Answers: true }
            })
        } else {
            // if poll only requires email for validation then get the voter from the email
            voter = await prisma.voter.findMany({
                where: {
                    email: voterEmail,
                    id: { in: poll.voters }
                },
                select: { Answers: true }
            })
        }
        if (!voter.length) {
            return []
        }
        const voterAnswers = voter[0].Answers

        const pollAnswerIds = pollAnswers.Answers.map(a => a.id)
        return voterAnswers.filter(voterAnswer => pollAnswerIds.indexOf(voterAnswer) + 1)
    }

    async upsertVerifyVoter({email, name = null, picture = null, password = null}) {
        const update = {
            picture,
            name,
            varified: true,
            password: await generate(password),
        }

        if(!password) {
            delete update.password
        }

        return await prisma.voter.upsert({
            select: {
                email: true,
                id: true,
                name: true,
                picture: true 
            },
            where: {
                email
            },
            create: {
                id: uuidv4(),
                email,
                picture,
                name,
                varified: true,
                password
            },
            update,
        })
    }

    async updateVoterPassword({password, email}) {
        return await prisma.voter.update({
            where: {email},
            data: {
                password: await generate(password)
            }
        })
    }

}
