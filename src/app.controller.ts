import { Controller, Get, Req, UseGuards, Request, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from '@nestjs/passport';
import { LocalAuthGuard } from './auth/auth/local-auth.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/ip')
  getIp(@Request() req) {
    return req.connection.remoteAddress;
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  // request body should look like: {"email": "john@bowes.com", "password": "changeme"}
  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Request() req) {
    return req.voter;
  }  

}
