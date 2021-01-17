import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { config } from 'dotenv';

import { Injectable } from '@nestjs/common';
import { VoterService } from '../voter/voter.service';

config();

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {

  constructor(
    private voterService: VoterService,
  ) {
    super({
      clientID       : process.env.FACE_APP_ID,
      clientSecret   : process.env.FACE_SECRET,
      callbackURL    : 'http://localhost:8000/redirect?strat=facebook',
      scope          : ['email', 'profile'],
    });
  }

  async validate (accessToken: string, refreshToken: string, profile: any): Promise<any> {
    const { name, email, picture } = profile._json
    
    console.log(profile)
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