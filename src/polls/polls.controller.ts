import { Controller, Body, Post, Param, Delete, Query, Get, HttpException, HttpStatus  } from '@nestjs/common';
import { CreatePollDto } from './dto/CreatePoll.dto';
import { VoteDto } from './dto/Vote.dto';
import { ValidationPipe } from './pipes/polls.pipe';
import { PollsService } from './polls.service';
import { Poll } from './interfaces/poll.interface'
import { VoteStatusRes } from './interfaces/voteStatusResponce.interface'
import { Answer } from '../answers/interfaces/answer.interface'

@Controller('polls')
export class PollsController {
  constructor(private readonly pollsService: PollsService) {}

  @Get('/list')
  async getPollList(
    @Query('page') page: number = 1,
    @Query('order') order: string = 'created',
    @Query('ended') ended: string = 'false',
    @Query('take') take: number,
  ) {
    const booleanEnded = ended === 'true' ? true : false
    return this.pollsService.getPollList({page, order, ended: booleanEnded, take})
  }

  @Get('/:pollId')
  async getPoll(
    @Param('pollId') pollId: string,
    @Query('ip') ip: string,
    @Query('email') email: string,
  ): Promise<Poll | { poll: Poll, userAnswers: string[]}> {

    // if not given an ip or email just get the poll
    const polldata = !ip && !email 
      ? await this.pollsService.findOne(pollId) 
      : await this.pollsService.findOneWithUserDetails({ip, email, pollId})

      return polldata
  }

  @Post()
  async createPoll(@Body() createPollDto: CreatePollDto) {
    const createdPoll = await this.pollsService.createPoll(createPollDto);
    return createdPoll.id;
  }

  @Post('/:pollId')
  async vote(@Param('pollId') pollId: string, @Query('validateEmail') validateEmail: string, @Body(new ValidationPipe()) voteData: VoteDto): Promise<VoteStatusRes> {
    const validateEmailBoolean = validateEmail === 'true' ? true : false
    const validAndPollId = await this.pollsService.validateVote({voteData, pollId, validateEmail: validateEmailBoolean});
    return validAndPollId;
  }

  @Get('/:pollId/answers')
  async getAnswers(@Param('pollId') pollId: string): Promise<Answer[]> {
    return (await this.pollsService.getAnswers(pollId)).Answers;
  }

  @Delete('/:pollId')
  async deletePoll(@Param('pollId') pollId: string, @Query('password') password: string) {
    return await this.pollsService.deletePoll(pollId, password);
  }
}
