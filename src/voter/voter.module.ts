import { Module, forwardRef } from '@nestjs/common';
import { VoterService } from './voter.service';
import { EmailModule } from 'src/email/email.module';
import { PollsModule } from 'src/polls/polls.module';

@Module({
  imports: [
    forwardRef(() => EmailModule),
    forwardRef(() => PollsModule)
  ],
  providers: [VoterService],
  exports: [VoterService],
})
export class VoterModule {}
