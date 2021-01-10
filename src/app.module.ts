import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PollsModule } from './polls/polls.module';
import { VoterModule } from './voter/voter.module';
import { EmailModule } from './email/email.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [PollsModule, VoterModule, EmailModule, ConfigModule.forRoot({
    envFilePath: '.development.env',
  }), AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
