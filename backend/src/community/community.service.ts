import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CommunityService {
  constructor(private prisma: PrismaService) {}

  async createPost(
    authorId: string,
    title: string,
    content: string,
    hackathonId?: string,
    tags?: string[],
  ) {
    // Since we don't have a Post model in schema, we'll use ChatSession creatively
    // Or store in a JSON field. For now, let's return a mocked structure.
    // In production, you'd add a Post model to schema.prisma

    const author = await this.prisma.participant.findUnique({
      where: { id: authorId },
      select: { id: true, fullName: true, email: true },
    });

    if (!author) {
      throw new NotFoundException('Author not found');
    }

    // Mock implementation - you should add a Post table to your schema
    const post = {
      id: `post-${Date.now()}`,
      title,
      content,
      authorId: author.id,
      authorName: author.fullName || author.email,
      hackathonId,
      tags: tags || [],
      likes: 0,
      replies: [] as any[],
      createdAt: new Date(),
    };

    // TODO: Store in database when Post model is added
    // await this.prisma.post.create({ data: post });

    return post;
  }

  async getPosts(hackathonId?: string, limit = 50, offset = 0) {
    // Mock implementation - returns empty array until Post model is added
    // You should add this to schema:
    /*
    model Post {
      id          String   @id @default(uuid())
      title       String
      content     String
      authorId    String
      author      Participant @relation(fields: [authorId], references: [id])
      hackathonId String?
      hackathon   Hackathon? @relation(fields: [hackathonId], references: [id])
      tags        String[]
      likes       Int @default(0)
      likedBy     String[] @default([])
      replies     Json @default("[]")
      createdAt   DateTime @default(now())
      updatedAt   DateTime @updatedAt
    }
    */

    return {
      posts: [],
      total: 0,
      limit,
      offset,
      message: 'Add Post model to schema.prisma to enable forum functionality',
    };
  }

  async getPost(id: string) {
    // Mock implementation
    return {
      id,
      title: 'Sample Post',
      content: 'Add Post model to schema.prisma',
      authorId: 'mock',
      authorName: 'System',
      likes: 0,
      replies: [],
      createdAt: new Date(),
    };
  }

  async likePost(postId: string, userId: string) {
    // Mock implementation
    return {
      postId,
      userId,
      liked: true,
      totalLikes: 1,
    };
  }

  async replyToPost(postId: string, userId: string, content: string) {
    const author = await this.prisma.participant.findUnique({
      where: { id: userId },
      select: { fullName: true, email: true },
    });

    return {
      id: `reply-${Date.now()}`,
      postId,
      authorId: userId,
      authorName: author?.fullName || author?.email || 'Anonymous',
      content,
      createdAt: new Date(),
    };
  }
}
