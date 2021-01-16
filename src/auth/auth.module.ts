import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { VoterModule } from '../voter/voter.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';
import { DiscordStrategy } from './discord.strategy';
import { GoogleStrategy } from './google.strategy';
import {
	HttpModule,

} from '@nestjs/common';

@Module({
  imports: [
    VoterModule,
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1d' },
    }),
    HttpModule
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, DiscordStrategy, GoogleStrategy],
  controllers: [AuthController],
})
export class AuthModule {}

