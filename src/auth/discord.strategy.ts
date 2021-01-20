import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-oauth2';
import axios from 'axios';
import { VoterService } from '../voter/voter.service';

@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy, 'discord') {
	constructor(
		private voterService: VoterService,
	) {
		super({
			authorizationURL : 'https://discord.com/api/oauth2/authorize?client_id=798309872042377336&redirect_uri=http%3A%2F%2Flocalhost%3A8000&response_type=code&scope=email%20identify',
			tokenURL         : 'https://discordapp.com/api/oauth2/token',
			clientID         : process.env.DIS_CLIENT_ID,
			clientSecret     : process.env.DIS_SECRET,
			callbackURL      : `${process.env.FRONT_END_URL}/rediect?strat=discord`,
			scope            : ['email', 'identify'],
		});
	}

	async validate(
		accessToken: string,
	): Promise<any> {
		const userRes = await axios.get('https://discord.com/api/users/@me', {
      headers: { authorization: `Bearer ${accessToken}`}
		})

		const { email, avatar, id, username } = userRes.data

    const user = {
      email,
      picture: avatar ? `https://cdn.discordapp.com/avatars/${id}/${avatar}.png?size=128` : null,
      name: username
    }

    const voter = await this.voterService.upsertVerifyVoter(user)

    // return the user with the cookie
    return voter
  }
}