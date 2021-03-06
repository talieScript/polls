import { Controller, Get, Query, HttpStatus, Body, Post} from '@nestjs/common';
import { EmailService } from './email.service';
import { Redirect } from '@nestjsplus/redirect';

@Controller('email')
export class EmailController {
    constructor(private readonly emailService: EmailService) { }

    @Redirect()
    @Get()
    async validateEmail(@Query('email') email: string, @Query('redirect') redirect: string) {
        const validateResponse = await this.emailService.validateEmail(email);
        if (!validateResponse) {
            return { statusCode: HttpStatus.FOUND, url: redirect };
        }
        return { statusCode: HttpStatus.FOUND, url: redirect };
    }

    @Post('/resend')
    async resendEmail(@Body() body: { email: string }) {
        return await this.emailService.resend(body.email)
    }
}
