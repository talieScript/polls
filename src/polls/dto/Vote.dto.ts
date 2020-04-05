import { IsString, IsArray, IsOptional } from 'class-validator';

export class VoteDto {
    @IsString()
    readonly ipAddress: string;
    @IsString()
    @IsOptional()
    readonly email?: string;
    @IsArray()
    readonly answers: string[];
}