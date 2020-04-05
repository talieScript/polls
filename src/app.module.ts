import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PollsModule } from './polls/polls.module';
import { PollsService } from './polls/polls.service';
import { VoterModule } from './voter/voter.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [PollsModule, VoterModule, EmailModule],
  controllers: [AppController],
  providers: [AppService, PollsService],
})
export class AppModule {}
