import {
  Body,
  Controller,
  HttpCode,
  Logger,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AccessTokenDto } from './dto/access-token.dto';
import { RefreshCredentialsDto } from './dto/refesh-token.dto';
import { SignupDto } from './dto/signup.dto';
import { UserTokensDto } from './dto/user-tokens.dto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  private logger = new Logger('AuthController');
  constructor(private authService: AuthService) {}

  @ApiOperation({
    summary: `Creates user and returns an access token and a refresh token. Both tokens contain user information.`,
  })
  @ApiCreatedResponse({
    description: 'User created successfully.',
    type: UserTokensDto,
  })
  @ApiConflictResponse({ description: 'User email address already registed.' })
  @Post('/signup')
  @HttpCode(201)
  async signup(
    @Body(ValidationPipe) signupDto: SignupDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
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

  @ApiOperation({
    summary: 'Generate a new access token given a refresh token.',
  })
  @ApiOkResponse({
    description: 'New access token generated',
    type: AccessTokenDto,
  })
  @ApiUnauthorizedResponse({ description: 'Invalid refresh token provided.' })
  @Post('/refresh')
  @HttpCode(200)
  async refreshCredentials(
    @Body(ValidationPipe) refreshCredentialsDto: RefreshCredentialsDto,
  ): Promise<AccessTokenDto> {
    return await this.authService.refreshCredentials(refreshCredentialsDto);
  }
}
