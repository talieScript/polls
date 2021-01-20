import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { VoterService } from '../voter/voter.service';
import { EmailService } from '../email/email.service';
import { compare } from '../utils/passwordHashing'
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import dayjs = require('dayjs');
import { v4 as uuidv4 } from 'uuid';



const prisma = new PrismaClient();
@Injectable()
export class AuthService {
  constructor(
    private voterService: VoterService,
    private jwtService: JwtService,
    private emailService: EmailService
  ) {}

  async authenticateVoter(email: string, pass: string): Promise<any> {
    const voter = await this.voterService.getVoter({
      where: { email }
    })

    if(voter?.password && await compare(pass, voter.password)) {
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

  async signUp({email, password, name}) {
    if (password?.length > 20 || password?.lenght < 8) {
      throw new HttpException({
        status: HttpStatus.NOT_ACCEPTABLE,
        error: `Password incorect length`,
      }, 406);
    }

    const voter = await this.voterService.getVoter({
      where: {email}
    })

    if (voter?.password?.length) {
      throw new HttpException({
        status: HttpStatus.FORBIDDEN,
        error: `User already exists`,
      }, 403);
    }

    const user = {
      email,
      name,
      password
    }

    return await this.voterService.upsertVerifyVoter(user)
  }

  async sendResetEmail(email) {
    const pendingEmail = await prisma.forgottenPasswordPendingEmail.upsert({
      where: {email},
      update: {
        id: uuidv4()
      },
      create: {
        id: uuidv4(),
        email,
      }
    })

    // send email using email service
    return this.emailService.sendPasswordResetEmail(email, pendingEmail.id)
  }

}