import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Aes256Service } from '../security/aes256.service';
import { Participant } from '@prisma/client';

interface SignupData {
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
  college?: string;
  role?: string;
}

interface LoginData {
  email: string;
  password: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private aes256: Aes256Service,
  ) {}

  async signup(
    data: SignupData,
    aadhaarFile?: Express.Multer.File,
    _idCardFile?: Express.Multer.File,
  ) {
    const { email, password, fullName, phone, college, role } = data;

    const existingUser = await this.prisma.participant.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const resolvedRole = role || 'Participant';
    const isParticipant = resolvedRole !== 'ADMIN';

    let encryptedAadhaar: string | null = null;

    if (isParticipant && aadhaarFile) {
      // 1. OCR Aadhaar
      const ocrFormData = new FormData();
      ocrFormData.append(
        'file',
        new Blob([new Uint8Array(aadhaarFile.buffer)], {
          type: aadhaarFile.mimetype,
        }),
        aadhaarFile.originalname,
      );

      const identityServiceUrl =
        process.env.IDENTITY_SERVICE_URL || 'http://127.0.0.1:8000';
      let ocrResponse: Response;
      try {
        ocrResponse = await fetch(`${identityServiceUrl}/ocr/aadhaar`, {
          method: 'POST',
          body: ocrFormData,
        });
      } catch (e) {
        console.error('Identity service connection error:', e);
        throw new BadRequestException('Identity service is unavailable.');
      }

      if (!ocrResponse.ok) {
        throw new BadRequestException(
          `Failed to process Aadhaar document OCR. Status: ${ocrResponse.status}`,
        );
      }

      const ocrResult = (await ocrResponse.json()) as {
        aadhaarNumber?: string;
      };
      const aadhaarNumber = ocrResult.aadhaarNumber;

      if (!aadhaarNumber) {
        throw new BadRequestException(
          'Could not clearly read a 12-digit Aadhaar number from the document.',
        );
      }

      encryptedAadhaar = this.aes256.encrypt(aadhaarNumber);
    }

    // Create user
    const user = await this.prisma.participant.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        phone,
        college,
        role: resolvedRole,
        aadhaarEncrypted: encryptedAadhaar,
      },
    });

    const payload = { email: user.email, sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      message: 'Signup successful',
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }

  async login(data: LoginData) {
    const { email, password, role } = data;

    const user = await this.prisma.participant.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.role !== role) {
      throw new UnauthorizedException('Invalid role');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password || '');
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }

  generateTokens(user: Pick<Participant, 'email' | 'id' | 'role'>) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    return { accessToken, refreshToken };
  }
}
