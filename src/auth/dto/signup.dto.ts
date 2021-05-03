import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class SignupDto {
  @IsString()
  @IsEmail()
  emailAddress: string;

  @IsString()
  name: string;

  @IsString()
  password: string;
}
