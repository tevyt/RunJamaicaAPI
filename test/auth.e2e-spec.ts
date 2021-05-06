import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from '../src/auth/auth.module';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from '../src/config/typeorm.config';
import { UserRepository } from '../src/auth/user.repository';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../src/auth/types/jwt-payload.interface';
import { TokenType } from '../src/auth/types/token-type.enum';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let userRepository: UserRepository;
  let jwtService: JwtService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule, TypeOrmModule.forRoot(typeOrmConfig)],
    }).compile();

    userRepository = moduleFixture.get<UserRepository>(UserRepository);
    jwtService = moduleFixture.get<JwtService>(JwtService);

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('/auth/signup (POST)', () => {
    it('returns access and refresh tokens on success.', (done) => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          emailAddress: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        })
        .expect(201)
        .expect(async (res) => {
          const { accessToken, refreshToken } = res.body;
          expect(accessToken).toBeDefined();
          expect(refreshToken).toBeDefined();
          expect(
            await userRepository.findOne({ emailAddress: 'test@example.com' }),
          ).toBeDefined();
        })
        .end(async (err, res) => {
          await userRepository.delete({ emailAddress: 'test@example.com' });
          return done(err);
        });
    });

    it('returns 409 when a user email is taken', (done) => {
      userRepository
        .create({
          emailAddress: 'test@example.com',
          name: 'Test User',
          passwordHash: '123',
          salt: '123',
        })
        .save()
        .then(() => {
          request(app.getHttpServer())
            .post('/auth/signup')
            .send({
              emailAddress: 'test@example.com',
              password: 'password123',
              name: 'Test User',
            })
            .expect(409)
            .end(async (err, res) => {
              await userRepository.delete({ emailAddress: 'test@example.com' });
              return done(err);
            });
        });
    });
  });

  describe('/auth/refresh (POST)', () => {
    it('returns a new access token given a refresh token', (done) => {
      const refreshTokenPayload: JwtPayload = {
        name: 'Test User',
        emailAddress: 'test@example.com',
        type: TokenType.REFRESH,
      };

      const refreshToken = jwtService.sign(refreshTokenPayload);

      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(200, done);
    });

    it('returns a 401 response when token is invalid', (done) => {
      const refreshTokenPayload: JwtPayload = {
        name: 'Test User',
        emailAddress: 'test@example.com',
        type: TokenType.ACCESS,
      };

      const accessToken = jwtService.sign(refreshTokenPayload);

      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: accessToken })
        .expect(401, done);
    });
  });

  afterEach(async () => {
    await app.close();
  });
});
