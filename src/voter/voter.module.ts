import { Module } from '@nestjs/common';
import { VoterService } from './voter.service';
import { EmailService } from 'src/email/email.service';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [EmailModule],
  providers: [VoterService],
  exports: [VoterService],
})
export class VoterModule {}
