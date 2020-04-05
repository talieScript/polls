export interface VoterInfo {
    /**
     * voters ip address
     */
    ipAddress: string;
    /**
     * Voter email
     */
    email: string;
    /**
     * An array of answer(s) id
     */
    answers: string[];
}