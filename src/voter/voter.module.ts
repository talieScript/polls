import { Module, forwardRef } from '@nestjs/common';
import { VoterService } from './voter.service';
import { EmailModule } from 'src/email/email.module';
import { PollsModule } from 'src/polls/polls.module';
import { VoterController } from './voter.controller';

@Module({
  imports: [
    forwardRef(() => EmailModule),
    forwardRef(() => PollsModule)
  ],
  providers: [VoterService],
  exports: [VoterService],
  controllers: [VoterController],
})
export class VoterModule {}
