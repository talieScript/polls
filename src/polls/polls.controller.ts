import { Controller, Body, Post, Param, Delete, Query, Get, HttpException, HttpStatus, UseGuards, Req  } from '@nestjs/common';
import { CreatePollDto } from './dto/createPoll.dto';
import { VoteDto } from './dto/Vote.dto';
import { ValidationPipe } from './pipes/polls.pipe';
import { PollsService } from './polls.service';
import { Poll } from './interfaces/poll.interface'
import { VoteStatusRes } from './interfaces/voteStatusResponce.interface'
import { Answer } from '../answers/interfaces/answer.interface'
import { DeletePollGuard } from './guards/deletePoll.guard'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('polls')
export class PollsController {
  constructor(private readonly pollsService: PollsService) {}

  @Get('/list')
  async getPollList(
    @Query('page') page: number = 1,
    @Query('order') order: string = 'created',
    @Query('ended') ended: string = 'false',
    @Query('take') take: number,
    @Query('searchTerm') searchTerm: string = '',
  ) {
    const booleanEnded = ended === 'true' ? true : false
    return this.pollsService.getPollList({page, order, ended: booleanEnded, take: Number(take), searchTerm})
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
    return createdPoll;
  }
  
  @UseGuards(JwtAuthGuard)
  @Post('/authenticated')
  async createPollWithUser(@Req() req, @Body() createPollDto: CreatePollDto) {
   const user = req.user
    const createdPoll = await this.pollsService.createPoll(createPollDto, user);
    return createdPoll;
  }

  @Post('/:pollId')
  async vote(@Param('pollId') pollId: string, @Body(new ValidationPipe()) voteData: VoteDto): Promise<VoteStatusRes> {
    const validAndPollId = await this.pollsService.validateVote({voteData, pollId});
    return validAndPollId;
  }

  @UseGuards(JwtAuthGuard)
  @Post('/:pollId/authenticated')
  async votewithUser(@Req() req, @Param('pollId') pollId: string, @Body(new ValidationPipe()) voteData: VoteDto): Promise<VoteStatusRes> {
    const user = req.user
    const validAndPollId = await this.pollsService.validateVote({voteData, pollId, user});
    return validAndPollId;
  }

  @Get('/:pollId/answers')
  async getAnswers(@Param('pollId') pollId: string): Promise<{Answers: Answer[], totalVotes: number}> {
    return await this.pollsService.getAnswers(pollId);
  }

  @UseGuards(JwtAuthGuard, DeletePollGuard)
  @Delete('/:pollId')
  async deletePoll(@Param('pollId') pollId: string) {
    return await this.pollsService.deletePoll(pollId);
  }
}
