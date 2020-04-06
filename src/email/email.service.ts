import { Injectable, HttpStatus, HttpException, Inject, forwardRef } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { PrismaClient } from '@prisma/client';
import { PendingEmailData } from './interfaces/pendingEmailData';
import { VoterService } from 'src/voter/voter.service';

const prisma = new PrismaClient();
@Injectable()
export class EmailService {
    constructor(
        @Inject(forwardRef(() => VoterService))
        private readonly voterService: VoterService,
    ) {}

    async sendValidationEmail({email, redirectPage}) {
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
                <a>${process.env.URL}/email?email=${email}&redirect=${redirectPage}</a>
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

    async validateEmail({email, redirectPage}) {
        // Get the pending email data
        const pendingEmailData: PendingEmailData = await prisma.pendingemail.findOne({
            where: { email },
        });

        if (!pendingEmailData || pendingEmailData.answers.length) {
            throw new HttpException({
                    status: HttpStatus.NOT_ACCEPTABLE,
                    error: `Link may be expired, try voting again.`,
                }, 406);
        }
        // Create voter
        await this.voterService.createVoterWithEamil(pendingEmailData)
        .catch(error => {
            throw new HttpException({
                    status: HttpStatus.NOT_ACCEPTABLE,
                    error: `Link may be expired, try voting again.`,
                }, 406);
        });

        // add vote

        // redirect to redirect page
    }
}
