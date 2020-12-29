import { Controller, Get, Param, Query, HttpStatus, HttpException, } from '@nestjs/common';
import { VoterService } from './voter.service';

@Controller('voter')
export class VoterController {
  constructor(private readonly voterService: VoterService) {}

  @Get('/answers/:pollId')
  async getAnswersForPoll(@Param('pollId') pollId: string, @Query('email') email: string,): Promise<string[]> {
    if (!email) {
      throw new HttpException({
        status: HttpStatus.NOT_ACCEPTABLE,
        error: 'Must provide email'
      }, 406);
    }
    const voter = await this.voterService.getVoter({
      where: {
        email
      }
    })
    if (!voter) {
      return []
    }
    return await this.voterService.getAnswersForPoll({voterId: voter?.id, pollId})
  }
}
