import { Controller, Get, Query, HttpStatus} from '@nestjs/common';
import { EmailService } from './email.service';
import { Redirect } from '@nestjsplus/redirect';

@Controller('email')
export class EmailController {
    constructor(private readonly emailService: EmailService) { }

    @Redirect()
    @Get()
    async validateEmail(@Query('email') email: string, @Query('redirect') redirect: string) {
        const validateResponse = await this.emailService.validateEmail({email, redirect});
        if (!validateResponse) {
            return { statusCode: HttpStatus.FOUND, url: `${redirect}?found=false` };
        }
        return { statusCode: HttpStatus.FOUND, url: `${redirect}?found=true` };
    }
}
