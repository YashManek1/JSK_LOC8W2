import {
  Controller,
  Post,
  Get,
  Param,
  UploadedFile,
  UseInterceptors,
  Body,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, resolve } from 'path';
import { EvaluateService } from './evaluate.service';

@Controller('api/evaluate')
export class EvaluateController {
  constructor(private readonly evaluateService: EvaluateService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('pptx', {
      storage: diskStorage({
        destination: resolve(__dirname, '../../../uploads'),
        filename: (req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${unique}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const ext = extname(file.originalname).toLowerCase();
        if (ext !== '.pptx' && ext !== '.pdf') {
          return cb(
            new BadRequestException('Only .pptx and .pdf files are allowed'),
            false,
          );
        }
        cb(null, true);
      },
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  )
  async evaluate(
    @UploadedFile() file: Express.Multer.File,
    @Body('teamName') teamName: string,
    @Body('githubUrl') githubUrl: string,
  ) {
    if (!teamName || !githubUrl || !file) {
      throw new BadRequestException(
        'teamName, githubUrl, and a .pptx or .pdf file are required.',
      );
    }

    const ghRegex = /^https?:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/;
    if (!ghRegex.test(githubUrl.trim())) {
      throw new BadRequestException('Invalid GitHub repository URL.');
    }

    return this.evaluateService.createEvaluation(
      teamName,
      githubUrl,
      file.path,
    );
  }

  @Get(':id')
  async getEvaluation(@Param('id') id: string) {
    const evaluation = await this.evaluateService.getEvaluation(id);
    if (!evaluation) {
      throw new NotFoundException('Evaluation not found.');
    }
    return evaluation;
  }
}
