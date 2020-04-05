import { Module } from '@nestjs/common';
import { PollsController } from './polls.controller';
import { PollsService } from './polls.service';
import { VoterModule } from 'src/voter/voter.module';

@Module({
  imports: [
    VoterModule,
  ],
  controllers: [PollsController],
  providers: [PollsService],
})
export class PollsModule {}
