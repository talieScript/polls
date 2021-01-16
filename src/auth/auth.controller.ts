import { Controller, Get, Req, UseGuards, Request, Post, Body, Param, Query, Res } from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import { VoterService } from '../voter/voter.service'
import { SignUpDto } from './dto/sign-up.dto';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';


@Controller('auth')
export class AuthController {

    constructor(
      private readonly authService: AuthService,
      private readonly voterService: VoterService,
      private readonly jwtService: JwtService
    ) {}

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

    @Get('/discord')
    @UseGuards(AuthGuard('discord'))
    async getUserFromDiscordLogin(@Req() req) {
      const access_token = this.jwtService.sign({ email: req.user.email, sub: req.user.id })

      return {
        user: req.user,
        access_token
      }
    }

    @Get('/google')
    @UseGuards(AuthGuard('google'))
    async googleAuth(@Req() req) {
      const access_token = this.jwtService.sign({ email: req.user.email, sub: req.user.id })

      return {
        user: req.user,
        access_token
      }
    }


    // @Get('google/redirect')
    // async getUserFromgoogle(@Query('code') code: string) {
    //   console.log(code)
    //   return await this.authService.getGoogleUserAndSignIn(code);
    // }

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
