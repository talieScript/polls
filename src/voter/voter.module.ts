import { Module, forwardRef } from '@nestjs/common';
import { VoterService } from './voter.service';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [forwardRef(() => EmailModule)],
  providers: [VoterService],
  exports: [VoterService],
})
export class VoterModule {}
