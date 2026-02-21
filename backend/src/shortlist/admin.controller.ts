/* eslint-disable @typescript-eslint/no-explicit-any */
import { Controller, Post, Get, Patch, Body, Param, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { ShortlistService } from './shortlist.service';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

@Controller('admin')
export class AdminController {
    constructor(private svc: ShortlistService) { }

    // ─── Config ──────────────────────────────────────────────────────
    @Get('config')
    getConfig() { return this.svc.getActiveConfig(); }

    @Post('config')
    saveConfig(@Body() dto: any) { return this.svc.upsertConfig(dto); }

    @Post('new-round')
    newRound() { return this.svc.newRound(); }

    // ─── Mass Upload ────────────────────────────────────────────────
    /** POST /api/admin/mass-upload — multipart field: pptxFiles[] */
    @Post('mass-upload')
    @UseInterceptors(FilesInterceptor('pptxFiles', 200, {
        storage: diskStorage({
            destination: (req, file, cb) => {
                if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
                cb(null, UPLOAD_DIR);
            },
            filename: (req, file, cb) => {
                const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
                cb(null, `${unique}-${file.originalname}`);
            },
        }),
        fileFilter: (req, file, cb) => {
            const ok = file.mimetype === 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
                || file.originalname.endsWith('.pptx');
            cb(null, ok);
        },
    }))
    async massUpload(@UploadedFiles() files: Express.Multer.File[]) {
        if (!files || files.length === 0) return { count: 0, etaSeconds: 0 };
        const teams = files.map(f => ({
            teamName: f.originalname.replace(/\.pptx$/i, '').replace(/[-_]/g, ' ').trim(),
            pptxPath: f.path,
        }));
        return this.svc.massCreateSubmissions(teams);
    }

    @Post('start-evaluation')
    startEvaluation() {
        return this.svc.startMassEvaluation();
    }

    // ─── Leaderboard ──────────────────────────────────────────────────
    @Get('leaderboard')
    leaderboard() { return this.svc.getLeaderboard(); }

    @Get('entries')
    allEntries() { return this.svc.getAllEntries(); }

    @Get('queue-status')
    queueStatus() { return this.svc.getQueueStatus(); }

    @Get('stats')
    stats() { return this.svc.getStats(); }

    // ─── Per-Entry Actions ────────────────────────────────────────────
    @Post('entries/:id/eliminate')
    eliminate(@Param('id') id: string) { return this.svc.eliminateEntry(id); }

    @Post('entries/:id/restore')
    restore(@Param('id') id: string) { return this.svc.restoreEntry(id); }

    @Post('entries/:id/requeue')
    requeue(@Param('id') id: string) { return this.svc.requeueEntry(id); }

    @Patch('entries/:id/note')
    setNote(@Param('id') id: string, @Body() body: { note: string }) {
        return this.svc.setAdminNote(id, body.note);
    }

    @Patch('entries/:id/override')
    override(@Param('id') id: string, @Body() body: { score: number; note?: string }) {
        return this.svc.overrideScore(id, body.score, body.note || '');
    }

    // ─── Publish / Rescore ────────────────────────────────────────────
    @Post('publish')
    publish() { return this.svc.publishLeaderboard(); }

    @Post('rescore')
    rescore() { return this.svc.rescoreAll(); }
}
