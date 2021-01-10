import { Controller, Get, Req, UseGuards, Request, Post } from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';


@Controller('auth')
export class AuthController {

    constructor( private readonly authService: AuthService) {}

    // request body should look like: {"email": "john@bowes.com", "password": "changeme"}
    @UseGuards(LocalAuthGuard)
    @Post('/login')
    async login(@Request() req) {
      return this.authService.login(req.user);
    }  
}
