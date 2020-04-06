import { Module, forwardRef } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { VoterModule } from 'src/voter/voter.module';

@Module({
  imports: [forwardRef(() => VoterModule)],
  providers: [EmailService],
  controllers: [EmailController],
  exports: [EmailService],
})
export class EmailModule {}
