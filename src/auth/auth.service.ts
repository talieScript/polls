import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { VoterService } from '../voter/voter.service';
import { EmailService } from '../email/email.service';
import { compare, generate } from '../utils/passwordHashing'
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

  async updatePassword({password, id}) {
    if (password?.length > 20 || password?.lenght < 8) {
      throw new HttpException({
        status: HttpStatus.NOT_ACCEPTABLE,
        error: `Password incorect length`,
      }, 406);
    }
    // check there is a pending request and it hsa not expired
    const pendingRequest = await prisma.forgottenPasswordPendingEmail.findUnique({
      where: {
        id
      }
    })
    if (!pendingRequest || dayjs(pendingRequest.created).isBefore(dayjs().subtract(1, 'hour'))) {
      throw new HttpException({
        status: HttpStatus.FORBIDDEN,
        error: `no pending request found or has expired`,
      }, 403);
    }

    const voter = await prisma.voter.findUnique({
      where: { email: pendingRequest.email }
    })

    // if voter has no password already, that means then have not signed up in the first place
    if (!voter.password) {
      throw new HttpException({
        status: HttpStatus.NOT_ACCEPTABLE,
        error: `User does no exist`,
      }, 406);
    }

    // chnage the users password
    await prisma.voter.update({
      where: { email: voter.email },
      data: { password: await generate(password) }
    })

    await prisma.forgottenPasswordPendingEmail.delete({
      where: { id }
    })

    return 'done'
  }



}