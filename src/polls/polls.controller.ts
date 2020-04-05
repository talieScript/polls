import { Controller, Body, Post, Param  } from '@nestjs/common';
import { CreatePollDto } from './dto/CreatePoll.dto';
import { VoteDto } from './dto/Vote.dto';
import { ValidationPipe } from './pipes/polls.pipe';
import { PollsService } from './polls.service';

@Controller('polls')
export class PollsController {
  constructor(private readonly pollsService: PollsService) { }

  @Post()
  async createPoll(@Body(new ValidationPipe()) createPollDto: CreatePollDto) {
      const createdPoll = await this.pollsService.createPoll(createPollDto);
      return createdPoll;
  }

  @Post('/:pollId')
  async vote(@Param('pollId') pollId: string, @Body(new ValidationPipe()) voteData: VoteDto) {
    const validAndPollId = await this.pollsService.castVote({voteData, pollId});
    return validAndPollId;
  }
}
