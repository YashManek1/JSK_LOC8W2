import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from '../prisma/prisma.service';
import { firstValueFrom } from 'rxjs';
import * as FormData from 'form-data';
import * as fs from 'fs';

@Injectable()
export class IdentityService {
    private readonly PYTHON_SERVICE_URL = process.env.IDENTITY_SERVICE_URL || 'http://localhost:8000';

    constructor(
        private httpService: HttpService,
        private prisma: PrismaService,
    ) { }

    async verifyAndSaveIdentity(userId: string, idCardPath: string, selfiePath: string) {
        try {
            // 1. Read the newly saved physical files from the hard drive
            const idCardStream = fs.createReadStream(idCardPath);
            const selfieStream = fs.createReadStream(selfiePath);

            // 2. Prepare Form Data for Python Microservice
            const formData = new FormData();
            formData.append('document', idCardStream);
            formData.append('selfie', selfieStream);

            // 3. Call your Python `/verify/face` endpoint
            const response = await firstValueFrom(
                this.httpService.post(`${this.PYTHON_SERVICE_URL}/verify/face`, formData, {
                    headers: { ...formData.getHeaders() },
                }),
            );

            const { isMatch, distance, faceEmbedding } = response.data;

            // If faces don't match, reject it (and optionally delete the uploaded files)
            if (!isMatch) {
                fs.unlinkSync(idCardPath);
                fs.unlinkSync(selfiePath);
                throw new HttpException('Face verification failed. Faces do not match.', HttpStatus.BAD_REQUEST);
            }

            // 4. THE FIX: Update Prisma with the local file URLs AND the faceEmbedding JSON
            const updatedUser = await this.prisma.participant.update({
                where: { id: userId },
                data: {
                    idCardUrl: `/${idCardPath}`,       // The URL to serve the ID card to Admin
                    liveSelfieUrl: `/${selfiePath}`,   // The URL to serve the selfie to Admin
                    faceEmbedding: faceEmbedding,      // The JSON array from Python for future fast check-ins!
                    isProfileComplete: true,           // Mark as verified
                },
            });

            return {
                success: true,
                message: 'Identity verified successfully',
                distance: distance,
                profileComplete: updatedUser.isProfileComplete
            };

        } catch (error) {
            throw new HttpException(
                error.response?.data?.detail || 'Identity verification service error',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}