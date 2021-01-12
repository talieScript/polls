import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-oauth2';

@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy, 'discord') {
	constructor() {
		super({
			authorizationURL : 'https://discord.com/api/oauth2/authorize?client_id=798309872042377336&redirect_uri=http%3A%2F%2Flocalhost%3A8000&response_type=code&scope=email%20identify',
			tokenURL         : 'https://discordapp.com/api/oauth2/token',
			clientID         : process.env.DIS_CLIENT_ID,
			clientSecret     : process.env.DIS_SECRET,
			callbackURL      : process.env.AUTH_REDIRECT,
			scope            : ['email', 'identify'],
		});
	}

	async validate(
		accessToken: string,
	): Promise<any> {

	}
}