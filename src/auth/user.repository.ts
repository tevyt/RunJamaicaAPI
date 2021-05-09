import { EntityRepository, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { SignupDto } from './dto/signup.dto';
import { User } from './entities/user.entity';
import {
  ConflictException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CredentialsDto } from './dto/credentials.dto';

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
        this.logger.log(
          `Attempt to register taken email address ${emailAddress}`,
        );
        throw new ConflictException(`Email Address is already registered.`);
      }
      this.logger.error(
        `Error with sign up ${JSON.stringify({ emailAddress, name })} - ${
          error.message
        }`,
      );
      throw new InternalServerErrorException();
    }
  }

  async signin(credentialsDto: CredentialsDto): Promise<User> {
    const { emailAddress, password } = credentialsDto;

    const user = await this.findOne({ emailAddress });

    if (!user) {
      return null;
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (passwordMatch) {
      return user;
    } else {
      return null;
    }
  }
}
