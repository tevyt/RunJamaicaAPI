import { EntityRepository, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { SignupDto } from './dto/signup.dto';
import { User } from './user.entity';
import {
  ConflictException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  private logger = new Logger('UserRepository');

  async signup(signUpDto: SignupDto): Promise<User> {
    const { emailAddress, name, password } = signUpDto;

    const salt = await bcrypt.genSalt();

    const user: User = this.create();
    user.emailAddress = emailAddress;
    user.name = name;
    user.salt = salt;
    user.passwordHash = await bcrypt.hash(password, salt);

    try {
      await user.save();
      return user;
    } catch (error) {
      //Postgresql error code for unique key constraint violations.
      if (error.code === '23505') {
        this.logger.verbose(
          `Attempt to register taken email address ${emailAddress}`,
        );
        throw new ConflictException(`Email Address is already registered.`);
      }
      this.logger.error(
        `Error with sign up ${JSON.stringify({ emailAddress, name })}`,
      );
      throw new InternalServerErrorException();
    }
  }
}
