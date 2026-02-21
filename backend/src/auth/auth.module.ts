import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { GithubStrategy } from './github.strategy';
import { SecurityModule } from '../security/security.module';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    SecurityModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super-secret-key',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, GithubStrategy],
  exports: [AuthService],
})
export class AuthModule {}
