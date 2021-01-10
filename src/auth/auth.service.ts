import { Injectable } from '@nestjs/common';
import { VoterService } from '../voter/voter.service';
import { compare } from '../utils/passwordHashing'

@Injectable()
export class AuthService {
  constructor(private voterService: VoterService) {}

  async authenticateVoter(email: string, pass: string): Promise<any> {
    const voter = await this.voterService.getVoter({
      where: { email }
    })


    
    if(voter && compare(pass, voter.password )) {
      return voter
    }

    return null
  }
}
