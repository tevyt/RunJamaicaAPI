import { SignupDto } from '../dto/signup.dto';
import { User } from '../entities/user.entity';
import { UserRepository } from '../user.repository';
import * as bcrypt from 'bcrypt';
import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';

describe('UserRepository', () => {
  let mockUserEntity: User;
  let userRepository: UserRepository;

  describe('signup', () => {
    const signupDto: SignupDto = {
      firstName: 'Test',
      lastName: 'User',
      emailAddress: 'test@example.com',
      password: 'password',
    };

    beforeEach(() => {
      mockUserEntity = new User();
      mockUserEntity.save = jest.fn().mockResolvedValue({});

      userRepository = new UserRepository();
      userRepository.create = jest.fn().mockReturnValue(mockUserEntity);
    });

    it('returns a user after successful save', async () => {
      const returnedUser = await userRepository.signup(signupDto);
      expect(returnedUser).toEqual(mockUserEntity);
    });

    it('hashes the credentials of saved user', async () => {
      const { passwordHash } = await userRepository.signup(signupDto);

      const passwordsMatch = await bcrypt.compare(
        signupDto.password,
        passwordHash,
      );

      expect(passwordsMatch).toBe(true);
    });

    it('throws a ConflictException if a taken emailAddress is tried', async () => {
      jest
        .spyOn(mockUserEntity, 'save')
        .mockRejectedValueOnce({ code: '23505' });

      await expect(userRepository.signup(signupDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('throws an InternalServerErrorException for unknown errors', async () => {
      jest
        .spyOn(mockUserEntity, 'save')
        .mockRejectedValueOnce({ message: 'test' });

      await expect(userRepository.signup(signupDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('signin', () => {
    let user: User;
    beforeEach(() => {
      userRepository.findOne = jest
        .fn()
        .mockImplementationOnce(({ emailAddress }) => {
          if (emailAddress === 'test@example.com') {
            const salt = bcrypt.genSaltSync();

            user = new User();
            user.id = 1;
            user.emailAddress = 'test@example.com';
            user.firstName = 'Test';
            user.lastName = 'User';
            user.salt = salt;
            user.passwordHash = bcrypt.hashSync('password123', salt);
            return user;
          }
          return null;
        });
    });
    it('returns a user when a matching email and password are provided', async () => {
      const { id } = await userRepository.signin({
        emailAddress: 'test@example.com',
        password: 'password123',
      });

      expect(id).toEqual(user.id);
    });

    it('returns null if an incorrect password is provided', async () => {
      const result = await userRepository.signin({
        emailAddress: 'test@example.com',
        password: 'password',
      });

      expect(result).toBeNull();
    });

    it('returns null if the user does not exist', async () => {
      const result = await userRepository.signin({
        emailAddress: 'test@example.net',
        password: 'password123',
      });

      expect(result).toBeNull();
    });
  });
});
