import { Poll } from "src/polls/interfaces/poll.interface";

export interface Answer {
    Poll: any;
    /**
     * The actual answer in a string
     */
    answer_string: string;
    /**
     * The total number of votes to this answer
     */
    votes: number;
    /**
     * id
     */
    id: string;

}
