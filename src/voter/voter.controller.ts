import { Controller, Get, Param, Query, HttpStatus, HttpException, } from '@nestjs/common';
import { VoterService } from './voter.service';

@Controller('voter')
export class VoterController {
  constructor(
    private readonly voterService: VoterService,
  ) {}

  @Get('/answers/:pollId')
  async getAnswersForPoll(@Param('pollId') pollId: string, @Query('email') email: string, @Query('ip') ip: string,): Promise<string[]> {
    if (!email && !ip) {
      throw new HttpException({
        status: HttpStatus.NOT_ACCEPTABLE,
        error: 'Must provide an email or ip address'
      }, 406);
    }
    return await this.voterService.getAnswersForPoll({voterIp: ip, pollId, voterEmail: email})
  }
}
