import { Controller, Get, Req, UseGuards, Request, Post, Body } from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';


@Controller('auth')
export class AuthController {

    constructor( private readonly authService: AuthService) {}

    @Post('/sign-up')
    async signUp(@Body() SignUpDto: SignUpDto) {
      
    }  

    // request body should look like: {"email": "john@bowes.com", "password": "changeme"}
    @UseGuards(LocalAuthGuard)
    @Post('/login')
    async login(@Request() req) {
      const jwtTokenObj = await this.authService.login(req.user);
      return {
        ...jwtTokenObj,
        ...req.user
      }
    }
}
