import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-facebook';
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
      clientID       : process.env.FACE_CLIENT_ID,
      clientSecret   : process.env.FACE_SECRET,
      callbackURL    : `${process.env.FRONT_END_URL}/redirect?strat=facebook`,
      profileFields  : ['email', 'displayName', 'picture']
    });
  }

  async validate (accessToken: string, refreshToken: string, profile: any): Promise<any> {
    const { name, email, picture } = profile._json
    const user = {
      email,
      picture: picture?.data?.url || null,
      name
    }

    const voter = await this.voterService.upsertVerifyVoter(user)

    // return the user with the cookie
    return voter
  }
}