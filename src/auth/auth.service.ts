import { Injectable } from '@nestjs/common';
import { VoterService } from '../voter/voter.service';
import { compare } from '../utils/passwordHashing'
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import * as FromData from 'form-data' 

@Injectable()
export class AuthService {
  constructor(
    private voterService: VoterService,
    private jwtService: JwtService
  ) {}

  async authenticateVoter(email: string, pass: string): Promise<any> {
    const voter = await this.voterService.getVoter({
      where: { email }
    })

    if(voter?.password && await compare(pass, voter.password )) {
      return voter
    }

    return null
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
        access_token: this.jwtService.sign(payload),
    };
  }

  async getGoogleUserAndSignIn(code) {
    const data = new FromData()
    data.append('grant_type', 'authorization_code');
    data.append('code', code);
    data.append('redirect_uri', process.env.AUTH_REDIRECT);
    data.append('client_id', process.env.GOO_CLIENT_ID);
    data.append('scope', 'profile');
    data.append('client_secret', process.env.GOO_SECRET);

    const res = await axios.post('https://oauth2.googleapis.com/token',
      data,
      {
        headers: {
          ...data.getHeaders()
        }
      }
    )


    const userRes = await axios.get('https://discord.com/api/users/@me', {
      headers: { authorization: `Bearer ${res.data.access_token}`}
    })

    console.log(userRes)

    const { email, avatar, id, username } = userRes.data
  }
}