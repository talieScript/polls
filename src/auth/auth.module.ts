import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { VoterModule } from '../voter/voter.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { JwtModule } from '@nestjs/jwt'

@Module({
  imports: [VoterModule, PassportModule, JwtModule],
  providers: [AuthService, LocalStrategy],
})
export class AuthModule {}

