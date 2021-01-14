import { Controller, Get, Req, UseGuards, Request, Post, Body, Param } from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import { VoterService } from '../voter/voter.service'
import { SignUpDto } from './dto/sign-up.dto';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './guards/jwt-auth.guard';


@Controller('auth')
export class AuthController {

    constructor( private readonly authService: AuthService, private readonly voterService: VoterService) {}

    @Post('/sign-up')
    async signUp(@Body() SignUpDto: SignUpDto) {
      
    }  

    // request body should look like: {"email": "john@bowes.com", "password": "changeme"}
    @Post('/login')
    @UseGuards(LocalAuthGuard)
    async login(@Request() req) {
      const jwtTokenObj = await this.authService.login(req.user);
      return {
        ...jwtTokenObj,
        ...req.user
      }
    }

    @Get('discord')
    @UseGuards(AuthGuard('discord'))
    async getUserFromDiscordLogin(@Req() req) {
      console.log(req)
      return req.user;
    }

    @Get('discord/:code')
    async getUserFromDiscord(@Param('code') code: string) {

      return await this.authService.getDiscordUserAndSignIn(code);
    }

    @Get('/user')
    @UseGuards(JwtAuthGuard)
    async getUser(@Request() req) {
      const user = await this.voterService.getVoter({
        where: {
          id: req.user.userId
        },
        select: {
          picture: true,
          email: true,
          name: true,
          id: true
        }
      })
      return {
        user
      }
    }
}
