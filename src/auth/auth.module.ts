import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { VoterModule } from '../voter/voter.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';

@Module({
  imports: [VoterModule, PassportModule],
  providers: [AuthService, LocalStrategy],
})
export class AuthModule {}

