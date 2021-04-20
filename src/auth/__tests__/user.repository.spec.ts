import { SignupDto } from '../dto/signup.dto';
import { User } from '../user.entity';
import { UserRepository } from '../user.repository';
import * as bcrypt from 'bcrypt';
import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';

describe('UserRepository', () => {
  describe('signup', () => {
    let mockUserEntity: User;
    let userRepository: UserRepository;

    const signupDto: SignupDto = {
      name: 'test',
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
});
