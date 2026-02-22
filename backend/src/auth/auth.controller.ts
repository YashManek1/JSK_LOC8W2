import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFiles,
  Req,
  Res,
  Get,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../prisma/prisma.service';
import { Aes256Service } from '../security/aes256.service';

interface SignupBody {
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
  college?: string;
  role?: string;
}

interface GitHubUser {
  id: string;
  username: string;
  email: string;
  accessToken: string;
  refreshToken: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
    private readonly aes256: Aes256Service,
  ) {}

  @Post('signup')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'aadhaar', maxCount: 1 },
      { name: 'idCard', maxCount: 1 },
    ]),
  )
  async signup(
    @Body() body: SignupBody,
    @UploadedFiles()
    files: { aadhaar?: Express.Multer.File[]; idCard?: Express.Multer.File[] },
  ) {
    const aadhaarFile = files?.aadhaar?.[0];
    const idCardFile = files?.idCard?.[0];
    const isParticipant = body.role !== 'ADMIN';

    if (isParticipant && (!aadhaarFile || !idCardFile)) {
      throw new BadRequestException(
        'Aadhaar and ID Card images are required for Participants',
      );
    }

    return this.authService.signup(body, aadhaarFile, idCardFile);
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string; role: string }) {
    return this.authService.login(body);
  }

  @Get('github')
  @UseGuards(AuthGuard('github'))
  githubAuth() {
    // Initiates the GitHub OAuth flow
  }

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubAuthRedirect(
    @Req() req: { user: GitHubUser },
    @Res() res: Response,
  ) {
    const githubUser: GitHubUser = req.user;

    if (!githubUser) {
      return res.redirect(
        'http://localhost:5173/login?error=github_auth_failed',
      );
    }

    const githubAccessToken = githubUser.accessToken;
    const githubRefreshToken = githubUser.refreshToken;
    const email = githubUser.email;

    const encryptedAccessToken = githubAccessToken
      ? this.aes256.encrypt(githubAccessToken)
      : null;
    const encryptedRefreshToken = githubRefreshToken
      ? this.aes256.encrypt(githubRefreshToken)
      : null;

    // Find participant by email
    const participant = await this.prisma.participant.findUnique({
      where: { email },
    });

    if (!participant) {
      return res.redirect('http://localhost:5173/login?error=user_not_found');
    }

    await this.prisma.participant.update({
      where: { id: participant.id },
      data: {
        githubAccessToken: encryptedAccessToken,
        githubRefreshToken: encryptedRefreshToken,
        githubUrl: `https://github.com/${githubUser.username}`,
      },
    });

    const { accessToken, refreshToken } =
      this.authService.generateTokens(participant);

    res.redirect(
      `http://localhost:5173/auth/success?accessToken=${accessToken}&refreshToken=${refreshToken}`,
    );
  }

  @Post('send-otp')
  async sendOtp(@Body() body: { email: string; phone?: string }) {
    if (!body.email && !body.phone) {
      throw new BadRequestException('Email or phone is required');
    }
    return this.authService.sendOtp(body.email, body.phone);
  }

  @Post('verify-otp')
  verifyOtp(@Body() body: { email: string; phone?: string; otp: string }) {
    if (!body.email && !body.phone) {
      throw new BadRequestException('Email or phone is required');
    }
    if (!body.otp) {
      throw new BadRequestException('OTP is required');
    }
    return this.authService.verifyOtp(body.email, body.phone, body.otp);
  }
}
