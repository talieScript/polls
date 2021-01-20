import { IsString } from 'class-validator';

export class ForgottenPasswordDto {
    @IsString()
    readonly email: string;
    @IsString()
    readonly password: string;
    @IsString()
    readonly id: string;
}