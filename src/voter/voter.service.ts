import { Injectable } from '@nestjs/common';
import { Voter } from './interfaces/voter.interface';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class VoterService {

    async voterValidationNoEmail({ipAddress, answers, pollId}) {
        const pollVoters: {voters: string[]} = await prisma.poll.findOne({
            where: {id: pollId},
            select: { voters: true },
        });

        const votersWithIp = await prisma.voter.findMany({
            where: {ip: ipAddress},
        });

        const voterHasVotedCheck = pollVoters.voters.some(pollVoter => {
            return votersWithIp.some(voter => voter.id === pollVoter);
        });

        if (voterHasVotedCheck) {
            return false;
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

        return newVoter.id;
    }

}
