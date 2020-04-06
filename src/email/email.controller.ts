import { Controller, Get, Param, Query, } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
    constructor(private readonly emailService: EmailService) { }

    @Get()
    async validateEmail(@Query('email') email: string, @Query('redirectPage') redirectPage: string) {
        this.emailService.validateEmail({email, redirectPage});
    }
}
