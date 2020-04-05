import { Injectable, HttpStatus, HttpException } from '@nestjs/common';
import { Poll, Options } from './interfaces/poll.interface';
import { Answer } from '../answers/interfaces/answer.interface';
import { PrismaClient } from '@prisma/client';
import * as dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import { VoterService } from '../voter/voter.service';

const prisma = new PrismaClient();

@Injectable()
export class PollsService {
    constructor(
        private readonly voterService: VoterService,
    ) {}
    /**
     *
     * @param createPollData
     * @summary Creates a new poll and returns newly created poll json.
     */
    async createPoll(createPollData) {

        if (!createPollData.options) {
            createPollData.options = '{"choiceNoStrict": false, "validateEmail": false, "validateIp": true, "choiceNo": 1}';
        } else {
            createPollData.options = JSON.stringify(createPollData.options);
        }

        // put poll in a queue to be created

        const { endDate, title, question, options, answers } = createPollData;
        const newPoll =  await prisma.poll.create({
            data: {
                title,
                question,
                options,
                created: dayjs().toISOString(),
                end_date: endDate,
                answer: {
                   create: answers.map((answer)  => ({
                                id: uuidv4(),
                                answer_string: answer,
                            }),
                   ),
                },
            },
        });
        return newPoll;
    }

    /**
     *
     * @param voteData
     * @summary Votes on a poll and creates a voter if not already existent
     */
    async castVote({voteData, pollId}) {
        const pollAnswers: Answer[] = await prisma.answer.findMany({
            where: { poll: pollId },
        })
        .catch(error => {
            throw new HttpException({
                status: HttpStatus.NOT_ACCEPTABLE,
                error,
            }, 406);
        });

        // Check answers given match poll
        voteData.answers.filter(answerId => {
            return !pollAnswers.some(pollAnswer => {
                return pollAnswer.id === answerId;
            });
        }).forEach(unfoundAnswerId => {
            throw new HttpException({
                status: HttpStatus.NOT_ACCEPTABLE,
                error: `Answer '${unfoundAnswerId}' connot be found`,
            }, 406);
        });

        // Get poll and parse poll options
        const poll: Poll = await prisma.poll.findOne({
            where: {id: pollId},
        });
        const pollOptions: Options = JSON.parse(poll.options);

        if (pollOptions.validateEmail && !voteData.email) {
            throw new HttpException({
                status: HttpStatus.NOT_ACCEPTABLE,
                error: `Email required for vote validation.`,
            }, 406);
        }

        //  if choiceNoStrict check answers given are the same as the choiceNo
        if (pollOptions.choiceNoStrict) {
            const validStrictAmount = voteData.answers.length === pollOptions.choiceNo;
            if (!validStrictAmount) {
                throw new HttpException({
                    status: HttpStatus.NOT_ACCEPTABLE,
                    error: `Answer choice number is strict, exactly ${pollOptions.choiceNo} must be given`,
                }, 406);
            }
        } else {
            // Check answers given match poll number choice
            const validAnswerAmount = voteData.answers.length <= pollOptions.choiceNo;
            if (!validAnswerAmount) {
                throw new HttpException({
                    status: HttpStatus.NOT_ACCEPTABLE,
                    error: 'Too many answers given. Cheeky!',
                }, 406);
            }
        }

        const { ipAddress} = voteData;

        // No email
        if (!pollOptions.validateEmail) {
          this.voterService.voterValidationNoEmail({ipAddress, pollId});
        }

    }
}
