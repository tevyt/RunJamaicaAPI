import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { SignupDto } from './dto/signup.dto';
import { JwtPayload } from './jwt-payload.interface';
import { UserRepository } from './user.repository';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(UserRepository) private userRepository: UserRepository,
  ) {}
  async signup(signupDto: SignupDto): Promise<{ accessToken: string }> {
    const user = await this.userRepository.signup(signupDto);
    const jwtPayload: JwtPayload = {
      emailAddress: user.emailAddress,
      name: user.name,
    };

    const accessToken = await this.jwtService.sign(jwtPayload);

    return { accessToken };
  }
}
