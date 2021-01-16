import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { config } from 'dotenv';

import { Injectable } from '@nestjs/common';
import { VoterService } from '../voter/voter.service';

config();

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {

  constructor(
    private voterService: VoterService,
  ) {
    super({
      clientID       : process.env.GOO_CLIENT_ID,
      clientSecret   : process.env.GOO_SECRET,
      callbackURL    : 'http://localhost:8000/redirect?strat=google',
      scope          : ['email', 'profile'],
    });
  }

  async validate (accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
    const { name, email, picture } = profile._json
    const user = {
      email,
      picture: picture || null,
      name: name
    }

    const voter = await this.voterService.upsertVerifyVoter(user)

    // return the user with the cookie
    return voter
  }
}