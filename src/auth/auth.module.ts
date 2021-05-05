import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserRepository } from './user.repository';
import { JwtConfig } from '../config/jwt.config';

const {
  accessTokenSecret,
  accessTokenExpiresIn,
} = new JwtConfig().config.mapping;

@Module({
  imports: [
    JwtModule.register({
      secret: accessTokenSecret,
      signOptions: { expiresIn: accessTokenExpiresIn },
    }),
    TypeOrmModule.forFeature([UserRepository]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
