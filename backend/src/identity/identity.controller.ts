import { Controller, Post, UseInterceptors, UploadedFiles, Req, UseGuards, BadRequestException } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { IdentityService } from './identity.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import * as fs from 'fs';

// Ensure uploads directory exists
const uploadPath = './uploads/identity';
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

@Controller('api/identity')
export class IdentityController {
    constructor(private readonly identityService: IdentityService) { }

    @Post('verify')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(
        FileFieldsInterceptor(
            [
                { name: 'idCard', maxCount: 1 },
                { name: 'liveSelfie', maxCount: 1 },
            ],
            {
                // THIS IS THE FIX: Actually saving files to the hard drive
                storage: diskStorage({
                    destination: uploadPath,
                    filename: (req, file, cb) => {
                        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                        cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
                    },
                }),
            }
        ),
    )
    async verifyIdentity(
        @Req() req: any,
        @UploadedFiles() files: { idCard?: Express.Multer.File[]; liveSelfie?: Express.Multer.File[] },
    ) {
        const userId = req.user.id;

        if (!files.idCard || !files.idCard[0]) throw new BadRequestException('ID Card is required');
        if (!files.liveSelfie || !files.liveSelfie[0]) throw new BadRequestException('Live selfie is required');

        // Pass the saved file paths to the service
        return await this.identityService.verifyAndSaveIdentity(
            userId,
            files.idCard[0].path,      // e.g., 'uploads/identity/idCard-1234.jpg'
            files.liveSelfie[0].path   // e.g., 'uploads/identity/liveSelfie-5678.jpg'
        );
    }
}