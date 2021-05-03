import { UnauthorizedException } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthService } from '../auth.service';
import { SignupDto } from '../dto/signup.dto';
import { JwtPayload } from '../types/jwt-payload.interface';
import { TokenType } from '../types/token-type.enum';
import { User } from '../entities/user.entity';

class MockUserRepository {
  async signup(signupDto: SignupDto): Promise<User> {
    const user = new User();
    user.emailAddress = signupDto.emailAddress;
    user.name = signupDto.name;

    return user;
  }
}

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'secret',
        }),
      ],
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useClass: MockUserRepository },
      ],
    }).compile();

    authService = moduleRef.get<AuthService>(AuthService);
    jwtService = moduleRef.get<JwtService>(JwtService);
  });

  describe('signup', () => {
    it('returns a signed JWT access token and refresh token', async () => {
      const signupDto: SignupDto = {
        name: 'test',
        emailAddress: 'test@example.com',
        password: 'test',
      };
      const { accessToken, refreshToken } = await authService.signup(signupDto);
      const decodedAccessToken = jwtService.decode(accessToken) as any;

      expect(decodedAccessToken.name).toEqual(signupDto.name);
      expect(decodedAccessToken.emailAddress).toEqual(signupDto.emailAddress);
      expect(decodedAccessToken.type).toEqual(TokenType.ACCESS);

      const decodedRefreshToken = jwtService.decode(refreshToken) as any;
      expect(decodedRefreshToken.name).toEqual(signupDto.name);
      expect(decodedRefreshToken.emailAddress).toEqual(signupDto.emailAddress);
      expect(decodedRefreshToken.type).toEqual(TokenType.REFRESH);
    });

    describe('refreshCredentials', () => {
      it('returns a new access token given a valid refresh token', async () => {
        const refreshTokenPayload: JwtPayload = {
          type: TokenType.REFRESH,
          name: 'Test Test',
          emailAddress: 'test@example.com',
        };
        const refreshToken = jwtService.sign(refreshTokenPayload);

        const { accessToken } = await authService.refreshCredentials({
          refreshToken,
        });

        const decodedAccessToken = jwtService.decode(accessToken) as JwtPayload;

        expect(decodedAccessToken.emailAddress).toEqual('test@example.com');
        expect(decodedAccessToken.name).toEqual('Test Test');
        expect(decodedAccessToken.type).toEqual(TokenType.ACCESS);
      });

      it('returns 401 given an access token', async () => {
        const accessTokenPayload: JwtPayload = {
          type: TokenType.ACCESS,
          name: 'Test Test',
          emailAddress: 'test@example.com',
        };
        const accessToken = jwtService.sign(accessTokenPayload);
        await expect(
          authService.refreshCredentials({ refreshToken: accessToken }),
        ).rejects.toThrow(UnauthorizedException);
      });

      it('returns 401 for an invalid refresh token', async () => {
        const invalidToken = 'test';
        await expect(
          authService.refreshCredentials({ refreshToken: invalidToken }),
        ).rejects.toThrow(UnauthorizedException);
      });
    });
  });
});
