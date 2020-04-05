import { Injectable } from '@nestjs/common';
import { Voter } from './interfaces/voter.interface';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class VoterService {

    async voterValidationNoEmail({ipAddress, pollId}) {
        const voter = await prisma.voter.findMany({
            where: { ip: ipAddress },
        });

        console.log(voter);
    }

}
