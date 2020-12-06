export interface VoteStatusRes {
  voteStatus?: 'alreadyVoted' | 'emailPending' | 'emailError' | 'emailSent' | 'votePassed',
  voterId?: string,
  passed?: boolean,
}