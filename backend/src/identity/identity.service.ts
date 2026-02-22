import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
// FIX 1: Use 'require' to bypass the TS construct signature error for FormData
const FormData = require('form-data');

@Injectable()
export class IdentityService {
    constructor(private readonly httpService: HttpService) { }

    async verifyIdentity(selfie: Express.Multer.File, document: Express.Multer.File) {
        // FIX 2: Explicitly type 'error' as 'any' so we can read its properties safely
        try {
            const formData = new FormData();
            formData.append('selfie', selfie.buffer, { filename: selfie.originalname });
            formData.append('document', document.buffer, { filename: document.originalname });

            const request = this.httpService.post('http://127.0.0.1:8000/verify/face', formData, {
                headers: formData.getHeaders(),
            });

            // FIX 3: Cast the response to 'any' to bypass the 'unknown' object error
            const response = await lastValueFrom(request) as any;
            const { isMatch, distance, faceEmbedding } = response.data;

            return { isMatch, distance, faceEmbedding };

        } catch (error: any) {
            throw new HttpException(
                error.response?.data?.detail || 'Identity verification service error',
                error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}