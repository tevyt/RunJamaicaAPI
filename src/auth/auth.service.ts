import {
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { AccessTokenDto } from './dto/access-token.dto';
import { RefreshCredentialsDto } from './dto/refesh-token.dto';
import { SignupDto } from './dto/signup.dto';
import { UserTokensDto } from './dto/user-tokens.dto';
import { JwtPayload } from './types/jwt-payload.interface';
import { TokenType } from './types/token-type.enum';
import { UserRepository } from './user.repository';
import { JwtConfig } from '../config/jwt.config';
import { CredentialsDto } from './dto/credentials.dto';

@Injectable()
export class AuthService {
  private logger: Logger = new Logger('AuthService');

  private jwtConfig = new JwtConfig();

  constructor(
    private jwtService: JwtService,
    @InjectRepository(UserRepository) private userRepository: UserRepository,
  ) {}

  async signup(signupDto: SignupDto): Promise<UserTokensDto> {
    const user = await this.userRepository.signup(signupDto);

    return this.signUserTokens(user.emailAddress, user.name);
  }

  async refreshCredentials(
    refreshCredentialsDto: RefreshCredentialsDto,
  ): Promise<AccessTokenDto> {
    const { refreshToken } = refreshCredentialsDto;

    const invalidRefreshTokenErrorMessage = 'Invalid refresh token provided.';

    let decodedJwt: JwtPayload;

    try {
      decodedJwt = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.jwtConfig.config.mapping.refreshTokenSecret,
      });
    } catch (error) {
      this.logger.log(
        `Attempt to use invalid JWT for refresh - ${error.message}`,
      );
      throw new UnauthorizedException(invalidRefreshTokenErrorMessage);
    }

    if (decodedJwt.type == TokenType.REFRESH) {
      const accessTokenPayload: JwtPayload = {
        emailAddress: decodedJwt.emailAddress,
        name: decodedJwt.name,
        type: TokenType.ACCESS,
      };
      const accessToken = await this.jwtService.signAsync(accessTokenPayload);
      return { accessToken };
    } else {
      this.logger.log('Attempt to use access token as refresh token.');
      throw new UnauthorizedException(invalidRefreshTokenErrorMessage);
    }
  }

  async signin(credentialsDto: CredentialsDto): Promise<UserTokensDto> {
    let user;

    try {
      user = await this.userRepository.signin(credentialsDto);
    } catch (error) {
      this.logger.error(
        `An error occured when trying to sign in user: ${credentialsDto.emailAddress} - ${error.message}`,
      );
      throw new InternalServerErrorException();
    }

    if (user) {
      return this.signUserTokens(user.emailAddress, user.name);
    }

    throw new UnauthorizedException('Invalid email address or password.');
  }

  private async signUserTokens(
    emailAddress: string,
    name: string,
  ): Promise<UserTokensDto> {
    const accessTokenPayload: JwtPayload = {
      emailAddress,
      name,
      type: TokenType.ACCESS,
    };

    const refreshTokenPayload: JwtPayload = {
      ...accessTokenPayload,
      type: TokenType.REFRESH,
    };

    const accessToken = await this.jwtService.sign(accessTokenPayload);
    const refreshToken = await this.jwtService.sign(refreshTokenPayload, {
      secret: this.jwtConfig.config.mapping.accessTokenSecret,
      expiresIn: this.jwtConfig.config.mapping.accessTokenExpiresIn,
    });
    return { accessToken, refreshToken };
  }
}
