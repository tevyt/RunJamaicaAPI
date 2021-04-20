import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthService } from '../auth.service';
import { SignupDto } from '../dto/signup.dto';
import { User } from '../user.entity';

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
    it('returns a signed JWT with users info in the payload', async () => {
      const signupDto: SignupDto = {
        name: 'test',
        emailAddress: 'test@example.com',
        password: 'test',
      };
      const { accessToken } = await authService.signup(signupDto);
      const decodedJwt = jwtService.decode(accessToken) as any;

      expect(decodedJwt.name).toEqual(signupDto.name);
      expect(decodedJwt.emailAddress).toEqual(signupDto.emailAddress);
    });
  });
});
