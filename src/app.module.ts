import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PollsModule } from './polls/polls.module';
import { VoterModule } from './voter/voter.module';
import { EmailModule } from './email/email.module';
import { ConfigModule } from '@nestjs/config';
import { GoogleStrategy } from './auth/google.strategy'

@Module({
  imports: [PollsModule, VoterModule, EmailModule, ConfigModule.forRoot({
    envFilePath: '.development.env',
  })],
  controllers: [AppController],
  providers: [AppService, GoogleStrategy],
})
export class AppModule {}
