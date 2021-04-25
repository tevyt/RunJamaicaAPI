import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshCredentialsDto {
  @IsString()
  refreshToken: string;
}
