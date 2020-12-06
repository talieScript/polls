import { Controller, Get, Param } from '@nestjs/common';
import { promises } from 'dns';
import { VoterService } from './voter.service';

@Controller('voter')
export class VoterController {
  constructor(private readonly voterService: VoterService) {}

  @Get('/answers/:voterId/:pollId')
  async getAnswersForPoll(@Param('pollId') pollId: string, @Param('voterId') voterId: string): Promise<string[]> {
    return await this.voterService.getAnswersForPoll({voterId, pollId})
  }
}
