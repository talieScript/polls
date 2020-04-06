import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { Voter } from './interfaces/voter.interface';
import { PrismaClient } from '@prisma/client';
import { EmailService } from 'src/email/email.service';

const prisma = new PrismaClient();

@Injectable()
export class VoterService {
    constructor(
        @Inject(forwardRef(() => EmailService))
        private readonly emailService: EmailService,
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
        });

        const voterWithEmail = await prisma.voter.findOne({
            where: {email},
        });

        // If no record of voter with that email then send email confirmation email.
        if (!voterWithEmail) {
            const pendingEmail = await prisma.pendingemail.findOne({
                where: {email},
            });
            if (pendingEmail) {
                return {
                    voterId: 'newVoter.id',
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

            const redirectPage = 'poll';

            this.emailService.sendValidationEmail({email, redirectPage});

        }


        return {
            voterId: 'newVoter.id',
            message: 'Validation passed; Varification email sent.',
            validVote: false,
        };
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

}
