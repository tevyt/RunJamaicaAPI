import { Body, Controller, Logger, Post, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';

@Controller('auth')
export class AuthController {
  private logger = new Logger('AuthController');
  constructor(private authService: AuthService) {}

  @Post('/signup')
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
}
