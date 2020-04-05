import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
    async sendValidationEmail(email) {
        debugger;
        const transporter = nodemailer.createTransport({
            host: 'smtp.zoho.eu',
            port: 465,
            secure: true, // use SSL
            auth: {
                user: 'taliesin.bowes@zohomail.eu',
                pass: '1Ginandtonic',
            }
        })

        var mailOptions = {
            from: '"My Site Conatct Form" <taliesin.bowes@zohomail.eu>', // sender address (who sends)
            to: 'taliesin.bowes@hotmail.co.uk', // list of receivers (who receives)
            subject: 'Conatct form submision from',
            html: `<h1>cunt</h1>` // html body
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                return console.log(error);
            }
            console.log('Message sent: '+info.response);
        });
    }
}
