import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshCredentialsDto {
  @IsString()
  refreshToken: string;
}
