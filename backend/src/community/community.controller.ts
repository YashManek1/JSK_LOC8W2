import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CommunityService } from './community.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateDiscussionDto } from './dto/create-discussion.dto';

interface RequestWithUser {
  user: { userId: string; email: string };
}

@Controller('api/community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Get('teams')
  async getTeams() {
    return this.communityService.getTeamsLookingForMembers();
  }

  @Get('solo')
  async getSoloParticipants() {
    return this.communityService.getSoloParticipants();
  }

  @Get('requests')
  async getRequests() {
    return []; // Mocked until team joining request system is fully built
  }

  @Get('discussions')
  async getDiscussions() {
    return this.communityService.getDiscussions();
  }

  @Post('discussions')
  @UseGuards(AuthGuard('jwt'))
  async createDiscussion(
    @Req() req: RequestWithUser,
    @Body() dto: CreateDiscussionDto,
  ) {
    return this.communityService.createDiscussion(
      req.user.userId,
      dto.title,
      dto.content,
    );
  }

  @Get('discussions/:id')
  getDiscussion(@Param('id') id: string) {
    return this.communityService.getDiscussion(id);
  }

  @Post('discussions/:id/like')
  @UseGuards(AuthGuard('jwt'))
  likeDiscussion(@Param('id') id: string) {
    return this.communityService.likeDiscussion(id);
  }

  @Post('discussions/:id/reply')
  @UseGuards(AuthGuard('jwt'))
  async replyToDiscussion(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
    @Body() body: { content: string },
  ) {
    return this.communityService.replyToDiscussion(
      id,
      req.user.userId,
      body.content,
    );
  }
}
