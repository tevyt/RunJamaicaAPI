import { EntityRepository, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { SignupDto } from './dto/signup.dto';
import { User } from './user.entity';
import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  async signup(signUpDto: SignupDto): Promise<User> {
    const { emailAddress, name, password } = signUpDto;
    const salt = await bcrypt.genSalt();

    const user: User = new User();
    user.emailAddress = emailAddress;
    user.name = name;
    user.salt = salt;
    user.passwordHash = await bcrypt.hash(password, salt);

    try {
      await user.save();
      return user;
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException(`Email Address is already registered.`);
      }
      throw new InternalServerErrorException();
    }
  }
}
