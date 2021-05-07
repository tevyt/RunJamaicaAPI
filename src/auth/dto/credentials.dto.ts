import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CredentialsDto {
  @IsString()
  @IsEmail()
  emailAddress: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
