import { Options } from '../interfaces/poll.interface';
import { IsString, IsArray, IsDateString, IsOptional, IsObject, MaxLength, ArrayMaxSize, ArrayNotEmpty, IsDate, Validate } from 'class-validator';
import { ValidEndDate } from './ValidEndDate';

export class CreatePollDto {
    @IsOptional()
    @IsString()
    @MaxLength(50, {
        message: 'Title is too long',
    })
    readonly title?: string;
    @IsString()
    @MaxLength(150, {
        message: 'Question is too long',
    })
    readonly question: string;
    @IsArray()
    @MaxLength(150, {
        each: true,
    })
    @ArrayMaxSize(10, {
        message: 'Maximum ten answer',
    })
    @ArrayNotEmpty({
        message: 'Answers cannot be empty',
    })
    readonly answers: string[];
     /**
     * TODO: Add better validation for options.
     */
    @IsString()
    @IsOptional()
    readonly options: string;
    // ios string
    @IsDateString()
    readonly endDate: Date;
    @IsString()
    readonly visibility: string
    @IsOptional()
    @IsString()
    readonly voterEmail: string
}