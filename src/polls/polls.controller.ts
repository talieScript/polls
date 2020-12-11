import { Controller, Body, Post, Param, Delete, Query, Get, HttpException, HttpStatus  } from '@nestjs/common';
import { CreatePollDto } from './dto/CreatePoll.dto';
import { CheckVotedDto } from './dto/checkVoted.dto';
import { VoteDto } from './dto/Vote.dto';
import { ValidationPipe } from './pipes/polls.pipe';
import { PollsService } from './polls.service';
import { Poll } from './interfaces/poll.interface'
import { VoteStatusRes } from './interfaces/voteStatusResponce.interface'
import { Answer } from '../answers/interfaces/answer.interface';

@Controller('polls')
export class PollsController {
  constructor(private readonly pollsService: PollsService) {}

  @Get('/:pollId')
  async getPoll(
    @Param('pollId') pollId: string,
    @Param('ip') ip: string,
    @Param('email') email: string,
  ): Promise<Poll> {
    // if not given an ip or email just get the poll
    const poll = !(ip || email) 
      ? await this.pollsService.findOne(pollId) 
      : await this.pollsService.findOneWithUserDetails({ip, email, pollId})

    if (!poll) {
      throw new HttpException({
        status: HttpStatus.NOT_FOUND,
      }, 404);
    }

    return poll
  }

  @Post()
  async createPoll(@Body() createPollDto: CreatePollDto) {
    const createdPoll = await this.pollsService.createPoll(createPollDto);
    return createdPoll.id;
  }

  @Post('/:pollId')
  async vote(@Param('pollId') pollId: string, @Body(new ValidationPipe()) voteData: VoteDto): Promise<VoteStatusRes> {
    const validAndPollId = await this.pollsService.validateVote({voteData, pollId});
    return validAndPollId;
  }

  @Delete('/:pollId')
  async deletePoll(@Param('pollId') pollId: string, @Query('password') password: string) {
    return await this.pollsService.deletePoll(pollId, password);
  }
}
