import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { JudgeService } from './judge.service';
import { Request } from 'express';
import { ScoreDto } from './dto/score.dto';

interface RequestWithUser extends Request {
  user?: { sub?: string };
}

@Controller('api/judge')
export class JudgeController {
  constructor(private readonly judgeService: JudgeService) {}

  @Get('teams')
  async getAssignedTeams(@Req() req: RequestWithUser) {
    const userId = req.user?.sub || (req.headers['x-user-id'] as string);
    if (!userId) {
      throw new UnauthorizedException('Missing user id');
    }
    return this.judgeService.getAssignedTeams(userId);
  }

  @Post('score/:teamId')
  async submitScore(
    @Param('teamId') teamId: string,
    @Body('scores') scores: ScoreDto,
    @Req() req: RequestWithUser,
  ) {
    const judgeId = req.user?.sub || (req.headers['x-user-id'] as string);
    if (!judgeId) {
      throw new UnauthorizedException('Missing user id');
    }
    return this.judgeService.submitScore(teamId, judgeId, scores);
  }

  @Post('note/:teamId')
  async submitNote(
    @Param('teamId') teamId: string,
    @Body('note') note: string,
    @Req() req: RequestWithUser,
  ) {
    const judgeId = req.user?.sub || (req.headers['x-user-id'] as string);
    if (!judgeId) {
      throw new UnauthorizedException('Missing user id');
    }
    return this.judgeService.submitNote(teamId, judgeId, note);
  }
}
