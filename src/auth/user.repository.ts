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
    const { emailAddress, firstName, lastName, password } = signUpDto;

    const salt = await bcrypt.genSalt();

    const user: User = this.create();
    user.emailAddress = emailAddress;
    user.firstName = firstName;
    user.lastName = lastName;
    user.salt = salt;
    user.passwordHash = await bcrypt.hash(password, salt);

    try {
      await user.save();
      return user;
    } catch (error) {
      //Postgresql error code for unique key constraint violations.
      const POSTGRES_UNIQUE_CONSTRAIN_VIOLATION_ERROR_CODE = '23505';
      if (error.code === POSTGRES_UNIQUE_CONSTRAIN_VIOLATION_ERROR_CODE) {
        this.logger.log(
          `Attempt to register taken email address ${emailAddress}`,
        );
        throw new ConflictException(`Email Address is already registered.`);
      }
      this.logger.error(
        `Error with sign up ${JSON.stringify({
          emailAddress,
          firstName,
          lastName,
        })} - ${error.message}`,
      );
      throw new InternalServerErrorException();
    }
  }

  async signin(credentialsDto: CredentialsDto): Promise<User> {
    const { emailAddress, password } = credentialsDto;

    const user = await this.findOne({ emailAddress });

    if (!user) {
      this.logger.log(`No user found with email address: ${emailAddress}`);
      return null;
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (passwordMatch) {
      return user;
    } else {
      this.logger.log(`Password did not match for ${emailAddress}`);
      return null;
    }
  }
}
