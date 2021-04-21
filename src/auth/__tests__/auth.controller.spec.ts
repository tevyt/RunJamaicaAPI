import { Test } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { AuthController } from '../auth.controller';
import { SignupDto } from '../dto/signup.dto';

class AuthServiceMock {
  async signup(
    _signupDto: SignupDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return { accessToken: 'test', refreshToken: 'test' };
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
      const result = { accessToken: 'test', refreshToken: 'test' };
      const responseBody = await authController.signup(signupDto);
      expect(responseBody).toEqual(result);
    });
  });
});
