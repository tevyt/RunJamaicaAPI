import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { SignupDto } from './dto/signup.dto';
import { JwtPayload } from './jwt-payload.interface';
import { TokenType } from './token-type.enum';
import { UserRepository } from './user.repository';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(UserRepository) private userRepository: UserRepository,
  ) {}
  async signup(
    signupDto: SignupDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.userRepository.signup(signupDto);

    const accessTokenPayload: JwtPayload = {
      emailAddress: user.emailAddress,
      name: user.name,
      type: TokenType.ACCESS,
    };

    const refreshTokenPayload: JwtPayload = {
      ...accessTokenPayload,
      type: TokenType.REFRESH,
    };

    const accessToken = await this.jwtService.sign(accessTokenPayload);
    const refreshToken = await this.jwtService.sign(refreshTokenPayload, {
      expiresIn: '365d',
    });
    return { accessToken, refreshToken };
  }
}
