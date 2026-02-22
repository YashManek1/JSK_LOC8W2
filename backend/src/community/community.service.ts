import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CommunityService {
  constructor(private prisma: PrismaService) {}

  async getTeamsLookingForMembers() {
    return this.prisma.team.findMany({
      where: {
        leaderId: { not: '' },
      },
      include: {
        participants: {
          select: {
            id: true,
            fullName: true,
            skills: true,
          },
        },
      },
    });
  }

  async getSoloParticipants() {
    return this.prisma.participant.findMany({
      where: { lookingForTeam: true },
      select: {
        id: true,
        fullName: true,
        college: true,
        skills: true,
        stats: true,
      },
    });
  }

  async createDiscussion(authorId: string, title: string, content: string) {
    const author = await this.prisma.participant.findUnique({
      where: { id: authorId },
    });

    if (!author) {
      throw new NotFoundException('Author not found');
    }

    return this.prisma.discussion.create({
      data: {
        title,
        content,
        authorId,
      },
    });
  }

  async getDiscussions() {
    return this.prisma.discussion.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async getDiscussion(id: string) {
    const discussion = await this.prisma.discussion.findUnique({
      where: { id },
    });
    if (!discussion) throw new NotFoundException('Discussion not found');
    return discussion;
  }

  async likeDiscussion(id: string) {
    return this.prisma.discussion.update({
      where: { id },
      data: { likes: { increment: 1 } },
    });
  }

  async replyToDiscussion(
    discussionId: string,
    authorId: string,
    content: string,
  ) {
    const discussion = await this.prisma.discussion.findUnique({
      where: { id: discussionId },
    });

    if (!discussion) {
      throw new NotFoundException('Discussion not found');
    }

    const newReply = {
      id: `reply-${Date.now()}`,
      authorId,
      content,
      createdAt: new Date().toISOString(),
    };

    const currentReplies = discussion.replies
      ? (discussion.replies as any[])
      : [];

    return this.prisma.discussion.update({
      where: { id: discussionId },
      data: {
        replies: [...currentReplies, newReply],
      },
    });
  }
}
