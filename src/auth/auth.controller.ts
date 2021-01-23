import { Controller, Get, Req, UseGuards, Request, Post, Body, Param, Query, Res } from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import { VoterService } from '../voter/voter.service'
import { SignUpDto } from './dto/sign-up.dto';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { ForgottenPasswordDto } from './dto/forgotten-password.dto';


@Controller('auth')
export class AuthController {

    constructor(
      private readonly authService: AuthService,
      private readonly voterService: VoterService,
      private readonly jwtService: JwtService
    ) {}

    @Post('/signup')
    async signUp(@Body() signUpDto: SignUpDto) {
      const user = await this.authService.signUp(signUpDto)
      const jwtTokenObj = await this.authService.login(user);
      return {
        user,
        ...jwtTokenObj
      }
    }

    @Post('/logout')
    async logout(@Request() req) {
      req.logout()
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
    
    @Get('/facebook')
    @UseGuards(AuthGuard('facebook'))
    async facebookAuth(@Req() req) {
      const access_token = this.jwtService.sign({ email: req.user.email, sub: req.user.id })

      return {
        user: req.user,
        access_token
      }
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

    // request pasword change
    @Get('/forgotten-password')
    async sendResetEmail(@Query('email') email: string) {
      await this.authService.sendResetEmail(email)
      return 'sent'
    }

    // post password reset
    @Post('/forgotten-password')
    async updatePassword(@Body() forgotPasswordDto: ForgottenPasswordDto) {
      return await this.authService.updatePassword(forgotPasswordDto)
    }

}
