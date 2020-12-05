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
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const mailOptions = {
            from: `"Easy Polls" <${process.env.EMAIL_USERNAME}>`,
            to: email,
            subject: 'Validate vote',
            html: `
                <h4>cunt</h4>
                <p>
                    Click <a href="${process.env.URL}/email?email=${email}&redirect=${process.env.EMAIL_REDIRECT}">here</a> to varifiy your email and validate your vote.<br>
                </p>
                <p>
                    Please do not reply to this email.
                </p>
            `,
        };

        // send mail with defined transport object
        return transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error)
                return error;
            }
            console.log(info)
            return true;
        })
    }

    async validateEmail({email, redirect}) {

        // Get the pending email data
        const pendingEmailData: PendingEmailData = await prisma.pendingEmail.findOne({
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
            if (!voter) {
                return false;
            }
        }

        // Delete pending email
        await prisma.pendingEmail.delete({
            where: { email },
        });

        // add vote
        await this.pollService.castVote({
            voterId: voter.id, answers: pendingEmailData.answers 
        });

        return true;
    }
}
