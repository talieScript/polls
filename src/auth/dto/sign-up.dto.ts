import { IsString } from 'class-validator';

export class SignUpDto {
    @IsString()
    readonly email: string;
    @IsString()
    readonly password: string;
    @IsString()
    readonly name: string;
}