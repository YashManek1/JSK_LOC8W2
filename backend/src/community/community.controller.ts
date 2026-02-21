import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CommunityService } from './community.service';
import { AuthGuard } from '@nestjs/passport';

interface RequestWithUser {
  user: { userId: string; email: string };
}

@Controller('api/community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Post('posts')
  @UseGuards(AuthGuard('jwt'))
  async createPost(
    @Req() req: RequestWithUser,
    @Body()
    body: {
      title: string;
      content: string;
      hackathonId?: string;
      tags?: string[];
    },
  ) {
    return this.communityService.createPost(
      req.user.userId,
      body.title,
      body.content,
      body.hackathonId,
      body.tags,
    );
  }

  @Get('posts')
  async getPosts(
    @Query('hackathonId') hackathonId?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const limitNum = limit ? parseInt(limit) : 50;
    const offsetNum = offset ? parseInt(offset) : 0;
    return this.communityService.getPosts(hackathonId, limitNum, offsetNum);
  }

  @Get('posts/:id')
  async getPost(@Param('id') id: string) {
    return this.communityService.getPost(id);
  }

  @Post('posts/:id/like')
  @UseGuards(AuthGuard('jwt'))
  async likePost(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.communityService.likePost(id, req.user.userId);
  }

  @Post('posts/:id/reply')
  @UseGuards(AuthGuard('jwt'))
  async replyToPost(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
    @Body() body: { content: string },
  ) {
    return this.communityService.replyToPost(
      id,
      req.user.userId,
      body.content,
    );
  }
}
