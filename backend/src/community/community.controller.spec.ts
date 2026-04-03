import { Test, TestingModule } from '@nestjs/testing';
import { CommunityController } from './community.controller';
import { CommunityService } from './community.service';
import { AuthGuard } from '@nestjs/passport';

const mockCommunityService = {
  getTeamsLookingForMembers: jest.fn(),
  getSoloParticipants: jest.fn(),
  getDiscussions: jest.fn(),
  createDiscussion: jest.fn(),
  getDiscussion: jest.fn(),
  likeDiscussion: jest.fn(),
  replyToDiscussion: jest.fn(),
};

const mockReq = { user: { userId: 'u1', email: 'u@u.com' } } as any;

describe('CommunityController', () => {
  let controller: CommunityController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommunityController],
      providers: [{ provide: CommunityService, useValue: mockCommunityService }],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue({ canActivate: () => true })
      .compile();
    controller = module.get<CommunityController>(CommunityController);
  });

  afterEach(() => jest.clearAllMocks());

  // ───── GET /api/community/teams ───────────────────────────────────
  describe('GET /api/community/teams', () => {
    it('should return teams looking for members', async () => {
      mockCommunityService.getTeamsLookingForMembers.mockResolvedValue([
        { id: 't1' },
      ]);
      const result = await controller.getTeams();
      expect(result).toEqual([{ id: 't1' }]);
    });
  });

  // ───── GET /api/community/solo ────────────────────────────────────
  describe('GET /api/community/solo', () => {
    it('should return solo participants', async () => {
      mockCommunityService.getSoloParticipants.mockResolvedValue([
        { id: 'p1' },
      ]);
      const result = await controller.getSoloParticipants();
      expect(result).toEqual([{ id: 'p1' }]);
    });
  });

  // ───── GET /api/community/requests ───────────────────────────────
  describe('GET /api/community/requests', () => {
    it('should return empty array (mocked)', async () => {
      const result = await controller.getRequests();
      expect(result).toEqual([]);
    });
  });

  // ───── GET /api/community/discussions ────────────────────────────
  describe('GET /api/community/discussions', () => {
    it('should return all discussions', async () => {
      mockCommunityService.getDiscussions.mockResolvedValue([{ id: 'd1' }]);
      const result = await controller.getDiscussions();
      expect(result).toEqual([{ id: 'd1' }]);
    });
  });

  // ───── POST /api/community/discussions ───────────────────────────
  describe('POST /api/community/discussions', () => {
    it('should create a discussion', async () => {
      mockCommunityService.createDiscussion.mockResolvedValue({ id: 'd2' });
      const dto = { title: 'Hello', content: 'World' };
      const result = await controller.createDiscussion(mockReq, dto);
      expect(mockCommunityService.createDiscussion).toHaveBeenCalledWith(
        'u1',
        'Hello',
        'World',
      );
      expect(result).toEqual({ id: 'd2' });
    });
  });

  // ───── GET /api/community/discussions/:id ─────────────────────────
  describe('GET /api/community/discussions/:id', () => {
    it('should get a specific discussion', async () => {
      mockCommunityService.getDiscussion.mockResolvedValue({ id: 'd1', title: 'T' });
      const result = await controller.getDiscussion('d1');
      expect(result).toHaveProperty('title', 'T');
    });
  });

  // ───── POST /api/community/discussions/:id/like ───────────────────
  describe('POST /api/community/discussions/:id/like', () => {
    it('should like a discussion', async () => {
      mockCommunityService.likeDiscussion.mockResolvedValue({ likes: 5 });
      const result = await controller.likeDiscussion('d1');
      expect(result).toEqual({ likes: 5 });
    });
  });

  // ───── POST /api/community/discussions/:id/reply ──────────────────
  describe('POST /api/community/discussions/:id/reply', () => {
    it('should reply to a discussion', async () => {
      mockCommunityService.replyToDiscussion.mockResolvedValue({ id: 'r1' });
      const result = await controller.replyToDiscussion(
        'd1',
        mockReq,
        { content: 'Nice post!' },
      );
      expect(mockCommunityService.replyToDiscussion).toHaveBeenCalledWith(
        'd1',
        'u1',
        'Nice post!',
      );
      expect(result).toEqual({ id: 'r1' });
    });
  });
});
