import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { VoterModule } from '../voter/voter.module';


@Module({
  imports: [VoterModule],
  providers: [AuthService]
})
export class AuthModule {}
