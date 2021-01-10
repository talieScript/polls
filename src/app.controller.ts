import { Controller, Get, Req, UseGuards, Request, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/ip')
  getIp(@Request() req) {
    return req.connection.remoteAddress;
  }

}
