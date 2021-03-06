import { Injectable, HttpStatus, HttpException, Delete } from '@nestjs/common';
import { Answer } from '../answers/interfaces/answer.interface';
import { Poll, PrismaClient } from '@prisma/client';
import * as dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import { VoterService } from '../voter/voter.service';
import { VoteStatusRes } from './interfaces/voteStatusResponce.interface'


const prisma = new PrismaClient();

@Injectable()
export class PollsService {
    constructor(
        private readonly voterService: VoterService,
    ) {}
    
    async findOne(pollId: string, select?: Object): Promise<any> {
        const findOptions = {
            where: {
                id: pollId
            },
            include: {
                Answers: true
            },
            select
        }
        if (select) {
            delete findOptions.include
        }
        const poll = await prisma.poll.findUnique(findOptions as any)
        if (!poll) {
            throw new HttpException({
                status: HttpStatus.NOT_FOUND,
            }, 404);
        }
        return  poll;
    }
    
    /**
     * find a poll and 
     */
    async findOneWithUserDetails({ email, ip, pollId }) {
        if (!email && !ip) {
            throw new HttpException({
                status: HttpStatus.NOT_ACCEPTABLE,
                error: 'Must provide email or ip.'
            }, 406);
        }

        // get the poll
        const poll = await this.findOne(pollId)

        const pollOptions = JSON.parse(poll.options)

        let userAnswers: string[] = []
        if (pollOptions.validateIp) {
            if (!ip) {
                return poll
            }

            const votersWithIp = await prisma.voter.findMany({
                where: {ip},
            });
    
            // checks if voter has already voted on poll
            const pollVoterId = poll.voters.find(pollVoter => {
                return votersWithIp.some(voter => voter.id === pollVoter);
            });

            if (!pollVoterId) {
                return poll
            }

            // If there is a voter then they have already voted
            const voter = await prisma.voter.findUnique({
                where: {
                    id: pollVoterId
                }
            })

            const pollAnswerIds = poll.Answers.map(a => a.id)
            userAnswers = voter.Answers.filter(answer => pollAnswerIds.indexOf(answer) + 1)
        } else {
            if (!email) {
                return poll
            }
            const pollVoterWithEmail = await prisma.voter.findMany({
                where: {
                    id: {
                        in: poll.voters
                    },
                    email
                }
            })

            const pollAnswerIds = poll.Answers.map(a => a.id)
            userAnswers = pollVoterWithEmail[0].Answers.filter(answer => pollAnswerIds.indexOf(answer) + 1)
        }

        return {
            poll,
            userAnswers,
        }
    }

    /**
     *
     * @param createPollData
     * @summary Creates a new poll and returns newly created poll json.
     */
    async createPoll(createPollData, user?) {
        if (!createPollData.options) {
            createPollData.options = '{"choiceNoStrict": false, "validateEmail": false, "validateIp": true, "choiceNo": 1}';
        } else {
            createPollData.options = `${JSON.stringify(createPollData.options)}`;
        }

        const { endDate, title, question, options, answers, visibility } = createPollData;

        const pollData = {
            id: uuidv4(),
            title,
            question,
            options,
            created: dayjs().toISOString(),
            end_date: endDate,
            Answers: {
               create: answers.map((answer, index)  => ({
                            id: uuidv4(),
                            answer_string: answer,
                            index: index,
                        }),
               ),
            },
            visibility,
        }

        if (!endDate.length) {
            delete pollData.end_date
        }


        if(user) {
            pollData['Voter'] = { connect: { id: user.userId }}
        }

        const newPoll: Poll =  await prisma.poll.create({
            data: pollData,
        });

        return newPoll.id;
    }

    /**
     *
     * @param voteData
     * @summary Votes on a poll and creates a voter if not already existent
     */
    async validateVote({voteData, pollId, user = null}): Promise<VoteStatusRes> {
        const pollAnswers = await prisma.answer.findMany({
            where: { Poll: pollId },
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
        const pollData: { options: string, voters: string[] } = await prisma.poll.findUnique({
            where: {id: pollId},
            select: {options: true, voters: true},
        });

        const parsedOptions = JSON.parse(pollData.options);

        if (parsedOptions.validateEmail && !voteData.email) {
            throw new HttpException({
                status: HttpStatus.NOT_ACCEPTABLE,
                error: `Email required for vote validation.`,
            }, 406);
        }

        //  if choiceNoStrict check answers given are the same as the choiceNo
        if (parsedOptions.choiceNoStrict) {
            const validStrictAmount = voteData.answers.length === parsedOptions.choiceNo;
            if (!validStrictAmount) {
                throw new HttpException({
                    status: HttpStatus.NOT_ACCEPTABLE,
                    error: `Answer choice number is strict, exactly ${parsedOptions.choiceNo} must be given`,
                }, 406);
            }
        } else {
            // Check answers given match poll number choice
            const validAnswerAmount = voteData.answers.length <= parsedOptions.choiceNo;
            if (!validAnswerAmount) {
                throw new HttpException({
                    status: HttpStatus.NOT_ACCEPTABLE,
                    error: 'Too many answers given. Cheeky!',
                }, 406);
            }
        }

        const { ipAddress, answers, email } = voteData;

        let voterValidationResponse = { passed: true };

        if (parsedOptions.validateIp) {
            voterValidationResponse = await this.voterService.voterValidationWithIp({ipAddress, answers, pollId})
        }
        if(parsedOptions.validateEmail && voterValidationResponse.passed) {
            voterValidationResponse = await this.voterService.voterValidationWithEmail({email, ipAddress, answers, pollId, user})
        }

        delete voterValidationResponse.passed
        return voterValidationResponse;
    }

    async castVote({voterId, answers}) {
        // Add votes to answers

        const answersFromDatabase: Answer[] = await Promise.all(answers.map(answerId => {
            return prisma.answer.findUnique({
                where: { id: answerId },
            });
        }));

        const pollId = await answersFromDatabase[0].Poll;

        const poll = await prisma.poll.findUnique({
            where: { id: pollId },
            select: { voters: true, totalVotes: true },
        });

        const voter = await prisma.voter.findUnique({
            where: {
                id: voterId
            },
            select: {
                Answers: true
            }
        })

        //add answers to voter
        await prisma.voter.update({
            where: {
                id: voterId
            },
            data: {
                Answers: { set: [...voter.Answers, ...answers] }
            }
        })

        // add voter to poll
        await prisma.poll.update({
            where: { id: pollId },
            data: { voters: { set: [...poll.voters, voterId]}, totalVotes: poll.totalVotes + answers.length},
        });

        return Promise.all(answersFromDatabase.map(answer => {
            return prisma.answer.update({
                where: { id: answer.id },
                data: { votes: {set: dayjs().unix()} },
            });
        }));
    }

    async deletePoll(id) {
        const poll = await prisma.poll.findUnique({
            where: { id },
        });

        if (!poll) {
            throw new HttpException({
                status: HttpStatus.NOT_FOUND,
                error: 'Id does not match any active polls.'
            }, 406);
        }

        return await prisma.poll.update({
            where: {
                id
              },
              data: {
                  deleted: dayjs().toDate()
              } 
        });
    }

    async getAnswers(pollId) {
        return await prisma.poll.findUnique({
            where: { id: pollId },
            select: { Answers: true, totalVotes: true }
        })
    }

    async getPollList({page, order, ended, take = 10, searchTerm}) {

        const date = dayjs().toDate()

        const polls = await prisma.$queryRaw(
            `
                SELECT id, created, title, question, end_date FROM "Poll" 
                WHERE "Poll".visibility = 'public' 
                AND (LOWER("Poll".title) LIKE $1 OR LOWER("Poll".question) LIKE $1)
                ${ended ? 'AND ("Poll".end_date < $2 OR "Poll".end_date > $2)' : `AND "Poll".end_date > $2`}
                ORDER BY ${order === 'created' ? '"Poll".created DESC' : '"Poll".end_date ASC'}
                LIMIT $3
                OFFSET $4
            `,
            `%${searchTerm.toLowerCase().trim()}%`,
            date,
            take,
            10 * (page - 1),
        )

        return polls
    }

}
