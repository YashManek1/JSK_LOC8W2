import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import * as fs from 'fs';
// Bypass TS construct signature error
const FormData = require('form-data');

@Injectable()
export class IdentityService {
    constructor(private readonly httpService: HttpService) { }

    // FIX: Updated to accept 3 arguments matching your controller
    // and type them as strings since the controller is passing the '.path'
    async verifyIdentity(participantId: string, idCardPath: string, selfiePath: string) {
        try {
            const formData = new FormData();

            // Read the files directly from the disk paths provided by the controller
            formData.append('document', fs.createReadStream(idCardPath));
            formData.append('selfie', fs.createReadStream(selfiePath));

            const request = this.httpService.post('http://127.0.0.1:8000/verify/face', formData, {
                headers: formData.getHeaders(),
            });

            const response = await lastValueFrom(request) as any;
            const { isMatch, distance, faceEmbedding } = response.data;

            // Note: You can now use the 'participantId' here to securely save 
            // the 'faceEmbedding' into your Prisma Database using PrismaService!

            return { isMatch, distance, faceEmbedding };

        } catch (error: any) {
            throw new HttpException(
                error.response?.data?.detail || 'Identity verification service error',
                error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}