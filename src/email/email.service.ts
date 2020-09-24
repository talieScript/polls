import { Injectable, HttpStatus, HttpException, Inject, forwardRef } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { PrismaClient } from '@prisma/client';
import { PendingEmailData } from './interfaces/pendingEmailData';
import { VoterService } from '../voter/voter.service';
import { PollsService } from '../polls/polls.service';

const prisma = new PrismaClient();
@Injectable()
export class EmailService {
    constructor(
        @Inject(forwardRef(() => VoterService))
        private readonly voterService: VoterService,
        @Inject(forwardRef(() => PollsService))
        private readonly pollService: PollsService,
    ) {}

    async sendValidationEmail(email) {
        const transporter = nodemailer.createTransport({
            host: 'smtp.zoho.eu',
            port: 465,
            secure: true, // use SSL
            auth: {
                user: 'taliesin.bowes@zohomail.eu',
                pass: '1Ginandtonic',
            },
        });

        const mailOptions = {
            from: '"Easy Polls Varification" <taliesin.bowes@zohomail.eu>', // sender address (who sends)
            to: email, // list of receivers (who receives)
            subject: 'Varify email',
            html: `
                <h4>cunt</h4>
                <p>click this link to varifiy yuor email and validate your vote. <br>
                <a>${process.env.URL}/email?email=${email}&redirect=${process.env.EMAIL_REDIRECT}</a>
                </p>
            `,
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                throw new HttpException({
                    statusCode: 500,
                    error,
                }, 500);
            }
            return true;
        });
    }

    async validateEmail({email, redirect}) {

        // Get the pending email data
        const pendingEmailData: PendingEmailData = await prisma.pendingemail.findOne({
            where: { email },
        });

        if (!pendingEmailData || !pendingEmailData.answers.length) {
            return false;
        }

        let voter = await this.voterService.getVoter({
            where: { email }
        });

        // If voter not found in database create a new one 
        if (!voter) {
            // Create voter
            voter = await this.voterService.createVoterWithEamil(pendingEmailData)
            .catch(error => {
                return null;
            });
        }

        if (!voter) {
            return false;
        }

        // Delete pedning email
        await prisma.pendingemail.delete({
            where: { email },
        });

        // add vote
        await this.pollService.castVote({
            voterId: voter.id, answers: pendingEmailData.answers 
        });

        return true;
    }
}
