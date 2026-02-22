import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Aes256Service } from '../security/aes256.service';
import { Participant, Role } from '@prisma/client';
import { MailService } from '../mail/mail.service';
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

// In-memory OTP store (use Redis in production)
const otpStore = new Map<
  string,
  { otp: string; expiresAt: number; attempts: number }
>();

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private aes256: Aes256Service,
    private mailService: MailService,
  ) { }

  async signup(
    data: SignupData,
    aadhaarFile?: Express.Multer.File,
    _idCardFile?: Express.Multer.File,
  ) {
    void _idCardFile;
    const { email, password, fullName, phone, college, role } = data;

    const existingUser = await this.prisma.participant.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    let resolvedRole: Role = Role.PARTICIPANT;
    if (role) {
      const upperRole = role.toUpperCase();
      if (Object.values(Role).includes(upperRole as Role)) {
        resolvedRole = upperRole as Role;
      }
    }
    const isParticipant = resolvedRole === Role.PARTICIPANT;

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

    if (user.role?.toUpperCase() !== role?.toUpperCase()) {
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

  async sendOtp(email?: string, phone?: string) {
    const identifier = email || phone;
    if (!identifier) {
      throw new BadRequestException('Email or phone is required');
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    // Store in memory (use Redis in production)
    otpStore.set(identifier, { otp, expiresAt, attempts: 0 });

    // Send OTP via email
    if (email) {
      try {
        const transporter = this.mailService['transporter'];
        await transporter.sendMail({
          from:
            process.env.SMTP_FROM ||
            '"Hackathon Platform" <noreply@hackathon.dev>',
          to: email,
          subject: 'Your OTP Code',
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2>Your Verification Code</h2>
              <p>Your OTP code is:</p>
              <h1 style="color: #6c63ff; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
              <p>This code will expire in 5 minutes.</p>
              <p style="color: #888; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
            </div>
          `,
        });
      } catch (error) {
        console.error('Failed to send OTP email:', error);
      }
    }

    // TODO: Send OTP via SMS if phone is provided
    // You'd integrate with Twilio, SNS, or other SMS service here

    return {
      success: true,
      message: `OTP sent to ${email ? 'email' : 'phone'}`,
      expiresIn: 300, // 5 minutes in seconds
    };
  }

  verifyOtp(email?: string, phone?: string, otp?: string) {
    const identifier = email || phone;
    if (!identifier || !otp) {
      throw new BadRequestException('Identifier and OTP are required');
    }

    const stored = otpStore.get(identifier);
    if (!stored) {
      throw new UnauthorizedException('OTP not found or expired');
    }

    // Check expiration
    if (Date.now() > stored.expiresAt) {
      otpStore.delete(identifier);
      throw new UnauthorizedException('OTP has expired');
    }

    // Check attempts
    if (stored.attempts >= 3) {
      otpStore.delete(identifier);
      throw new UnauthorizedException('Too many failed attempts');
    }

    // Verify OTP
    if (stored.otp !== otp) {
      stored.attempts += 1;
      throw new UnauthorizedException('Invalid OTP');
    }

    // Success - remove OTP
    otpStore.delete(identifier);

    return {
      success: true,
      message: 'OTP verified successfully',
      verified: true,
    };
  }
}
