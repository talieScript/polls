import { Module, forwardRef } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { VoterModule } from 'src/voter/voter.module';
import { PollsModule } from 'src/polls/polls.module';

@Module({
  imports: [
    forwardRef(() => PollsModule),
    forwardRef(() => VoterModule),
  ],
  providers: [EmailService],
  controllers: [EmailController],
  exports: [EmailService],
})
export class EmailModule {}
