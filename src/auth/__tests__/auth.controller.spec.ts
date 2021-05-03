import { Test } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { AuthController } from '../auth.controller';
import { SignupDto } from '../dto/signup.dto';
import { RefreshCredentialsDto } from '../dto/refesh-token.dto';
import { UserTokensDto } from '../dto/user-tokens.dto';
import { AccessTokenDto } from '../dto/access-token.dto';

class AuthServiceMock {
  async signup(_signupDto: SignupDto): Promise<UserTokensDto> {
    return { accessToken: 'test', refreshToken: 'test' };
  }

  async refreshCredentials(
    _refreshCredentialsDto: RefreshCredentialsDto,
  ): Promise<AccessTokenDto> {
    return { accessToken: 'test' };
  }
}

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useClass: AuthServiceMock }],
    }).compile();

    authService = moduleRef.get<AuthService>(AuthService);
    authController = moduleRef.get<AuthController>(AuthController);
  });

  describe('signup', () => {
    const signupDto: SignupDto = {
      name: 'Test',
      emailAddress: 'test@example.com',
      password: 'test',
    };

    it('returns the access token', async () => {
      const result: UserTokensDto = {
        accessToken: 'test',
        refreshToken: 'test',
      };
      const responseBody = await authController.signup(signupDto);
      expect(responseBody).toEqual(result);
    });
  });

  describe('refreshCredentials', () => {
    it('returns a new refresh token given valid credentials', async () => {
      const { accessToken } = await authController.refreshCredentials({
        refreshToken: 'test',
      });

      expect(accessToken).toEqual('test');
    });
  });
});
