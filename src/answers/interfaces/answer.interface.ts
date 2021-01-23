import { Poll } from "src/polls/interfaces/poll.interface";

export interface Answer {
    Poll: any;
    /**
     * The actual answer in a string
     */
    answer_string: string;
    /**
     * an array of unix timestamps
     */
    votes: number[];
    /**
     * id
     */
    id: string;

}
