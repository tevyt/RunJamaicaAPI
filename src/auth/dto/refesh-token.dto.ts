import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshCredentialsDto {
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}
