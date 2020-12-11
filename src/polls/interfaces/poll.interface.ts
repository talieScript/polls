import { Answer } from '../../answers/interfaces/answer.interface';

export interface Options {
    /**
     * Is the answer amount strict, meaning the choice no and answer length must be the same.
     */
    choiceNoStrict: boolean;
    /**
     * validete votes with email
     */
    validateEmail: boolean;
    /**
     * The amount of answers each user can give
     */
    choiceNo: number;
}

export interface Poll {
    Answer: Answer[]
    /**
     * The poll name
     */
    title: string;
    /**
     * The Quetion being asked
     */
    question: string;
    /**
     * Vote validation options
     */
    options: string;
    /**
     * creation date
     */
    created: Date;
    /**
     * Date the poll will expire
     */
    end_date: Date;
    /**
     * Pool id
     */
    id: string;
    /**
     * voter ids
     */
    voters: string[];
}