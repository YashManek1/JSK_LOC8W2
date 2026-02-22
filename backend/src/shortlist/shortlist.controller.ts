import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { ShortlistService } from './shortlist.service';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

@Controller('shortlist')
export class ShortlistController {
  constructor(private svc: ShortlistService) {}

  /**
   * POST /api/shortlist/submit
   * Body (multipart): teamName, githubUrl?, pptx file
   */
  @Post('submit')
  @UseInterceptors(
    FileInterceptor('pptx', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          if (!fs.existsSync(UPLOAD_DIR))
            fs.mkdirSync(UPLOAD_DIR, { recursive: true });
          cb(null, UPLOAD_DIR);
        },
        filename: (req, file, cb) => {
          const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
          cb(null, `${unique}-${file.originalname}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const ok =
          file.mimetype ===
            'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
          file.originalname.endsWith('.pptx');
        cb(null, ok);
      },
      limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB max
    }),
  )
  async submit(
    @UploadedFile() pptxFile: Express.Multer.File,
    @Body() body: Record<string, string>,
  ) {
    if (!pptxFile) throw new Error('PPTX file is required.');
    if (!body.teamName?.trim()) throw new Error('Team name is required.');

    return this.svc.createSubmission({
      teamName: body.teamName,
      githubUrl: body.githubUrl,
      pptxPath: pptxFile.path,
    });
  }

  /**
   * GET /api/shortlist/:id
   * Participant-safe: no adminNote in response
   */
  @Get(':id')
  getEntry(@Param('id') id: string) {
    return this.svc.getEntry(id);
  }
}
