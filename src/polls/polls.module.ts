import { Module, forwardRef } from '@nestjs/common';
import { PollsController } from './polls.controller';
import { PollsService } from './polls.service';
import { VoterModule } from 'src/voter/voter.module';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [forwardRef(() => EmailModule), VoterModule],
  controllers: [PollsController],
  providers: [PollsService],
  exports: [PollsService],
})
export class PollsModule {}
