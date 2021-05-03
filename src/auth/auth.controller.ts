import { Body, Controller, Logger, Post, ValidationPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RefreshCredentialsDto } from './dto/refesh-credentials.dto';
import { SignupDto } from './dto/signup.dto';
import { UserTokens } from './dto/userTokens.dto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  private logger = new Logger('AuthController');
  constructor(private authService: AuthService) {}

  @Post('/signup')
  @ApiOperation({
    summary: `Creates user and returns an access token and a refresh token. Both tokens contain user information.`,
  })
  async signup(
    @Body(ValidationPipe) signupDto: SignupDto,
  ): Promise<UserTokens> {
    this.logger.log(
      `Sign up request for ${JSON.stringify({
        emailAddress: signupDto.emailAddress,
        name: signupDto.name,
      })}`,
    );
    const authServiceResponse = await this.authService.signup(signupDto);

    this.logger.log(
      `Successful signup from ${JSON.stringify({
        emailAddress: signupDto.emailAddress,
        name: signupDto.name,
      })}`,
    );
    return authServiceResponse;
  }

  @Post('/refresh')
  async refreshCredentials(
    @Body(ValidationPipe) refreshCredentialsDto: RefreshCredentialsDto,
  ): Promise<{ accessToken: string }> {
    return await this.authService.refreshCredentials(refreshCredentialsDto);
  }
}
