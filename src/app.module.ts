import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PollsModule } from './polls/polls.module';
import { PollsService } from './polls/polls.service';

@Module({
  imports: [PollsModule],
  controllers: [AppController],
  providers: [AppService, PollsService],
})
export class AppModule {}
