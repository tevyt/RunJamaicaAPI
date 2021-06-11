import {
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthService } from '../auth.service';
import { SignupDto } from '../dto/signup.dto';
import { JwtPayload } from '../types/jwt-payload.interface';
import { TokenType } from '../types/token-type.enum';
import { User } from '../entities/user.entity';
import { CredentialsDto } from '../dto/credentials.dto';
import { userInfo } from 'node:os';
import { UserRepository } from '../user.repository';

const existingUserEmailAddress = 'test@example.com';
const existingUserFirstName = 'Test';
const existingUserLastName = 'User';
const existingUserPassword = 'password123';

class MockUserRepository {
  async signup(signupDto: SignupDto): Promise<User> {
    const user = new User();
    user.emailAddress = signupDto.emailAddress;
    user.firstName = signupDto.firstName;
    user.lastName = signupDto.lastName;

    return user;
  }

  async signin(credentialsDto: CredentialsDto): Promise<User | undefined> {
    const { emailAddress, password } = credentialsDto;

    if (
      emailAddress === existingUserEmailAddress &&
      password === existingUserPassword
    ) {
      const user = new User();
      user.emailAddress = existingUserEmailAddress;
      user.firstName = existingUserFirstName;
      user.lastName = existingUserLastName;
      return user;
    }
  }
}

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: JwtService;
  let userRepository: UserRepository;

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
    userRepository = moduleRef.get<UserRepository>(UserRepository);
  });

  describe('signup', () => {
    it('returns a signed JWT access token and refresh token', async () => {
      const signupDto: SignupDto = {
        firstName: 'Test',
        lastName: 'User',
        emailAddress: 'test@example.com',
        password: 'test',
      };
      const { accessToken, refreshToken } = await authService.signup(signupDto);
      const decodedAccessToken = jwtService.decode(accessToken) as any;

      expect(decodedAccessToken.firstName).toEqual(signupDto.firstName);
      expect(decodedAccessToken.lastName).toEqual(signupDto.lastName);
      expect(decodedAccessToken.emailAddress).toEqual(signupDto.emailAddress);
      expect(decodedAccessToken.type).toEqual(TokenType.ACCESS);

      const decodedRefreshToken = jwtService.decode(refreshToken) as any;
      expect(decodedRefreshToken.firstName).toEqual(signupDto.firstName);
      expect(decodedRefreshToken.lastName).toEqual(signupDto.lastName);
      expect(decodedRefreshToken.emailAddress).toEqual(signupDto.emailAddress);
      expect(decodedRefreshToken.type).toEqual(TokenType.REFRESH);
    });

    describe('refreshCredentials', () => {
      it('returns a new access token given a valid refresh token', async () => {
        const refreshTokenPayload: JwtPayload = {
          type: TokenType.REFRESH,
          firstName: 'Test',
          lastName: 'User',
          emailAddress: 'test@example.com',
        };
        const refreshToken = jwtService.sign(refreshTokenPayload);

        const { accessToken } = await authService.refreshCredentials({
          refreshToken,
        });

        const decodedAccessToken = jwtService.decode(accessToken) as JwtPayload;

        expect(decodedAccessToken.emailAddress).toEqual('test@example.com');
        expect(decodedAccessToken.firstName).toEqual('Test');
        expect(decodedAccessToken.lastName).toEqual('User');
        expect(decodedAccessToken.type).toEqual(TokenType.ACCESS);
      });

      it('returns 401 given an access token', async () => {
        const accessTokenPayload: JwtPayload = {
          type: TokenType.ACCESS,
          firstName: 'Test',
          lastName: 'User',
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

  describe('signin', () => {
    it('returns user tokens if credentials match an existing user', async () => {
      const { accessToken, refreshToken } = await authService.signin({
        emailAddress: existingUserEmailAddress,
        password: existingUserPassword,
      });

      const { emailAddress: accessTokenEmailAddress } = jwtService.decode(
        accessToken,
      ) as JwtPayload;
      const { emailAddress: refreshTokenEmailAddress } = jwtService.decode(
        refreshToken,
      ) as JwtPayload;

      expect(accessTokenEmailAddress).toEqual(existingUserEmailAddress);
      expect(refreshTokenEmailAddress).toEqual(existingUserEmailAddress);
    });
    it('throws internal server error exception if an error occurs', async () => {
      userRepository.signin = jest.fn().mockImplementationOnce(() => {
        throw new Error('Unable to connect to db');
      });

      await expect(
        authService.signin({
          emailAddress: 'test@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
