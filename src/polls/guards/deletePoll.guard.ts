import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  CanActivate
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class DeletePollGuard implements CanActivate {

  private prisma: any

  constructor() {
     this.prisma = new PrismaClient();
  }


  async canActivate(
      context: ExecutionContext,
  ): Promise<boolean> {
    const args = context.getArgByIndex(0)
    const voter = args.user
    const pollId = args.params.pollId
    
    const poll = await this.prisma.poll.findOne({
      where: { id: pollId }
    })

    if (voter.email === poll.voterEmail) {
      return true
    }

    new UnauthorizedException()

  }
}
