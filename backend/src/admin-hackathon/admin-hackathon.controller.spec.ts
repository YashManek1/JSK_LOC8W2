import { Test, TestingModule } from '@nestjs/testing';
import { AdminHackathonController } from './admin-hackathon.controller';
import { AdminHackathonService } from './admin-hackathon.service';
import { AuthGuard } from '@nestjs/passport';

const mockAdminHackathonService = {
  createHackathon: jest.fn(),
  getMyHackathons: jest.fn(),
  getStats: jest.fn(),
  allocateProblemStatements: jest.fn(),
};

const mockReq = { user: { userId: 'admin1', email: 'admin@a.com' } } as any;

describe('AdminHackathonController', () => {
  let controller: AdminHackathonController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminHackathonController],
      providers: [
        {
          provide: AdminHackathonService,
          useValue: mockAdminHackathonService,
        },
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue({ canActivate: () => true })
      .compile();
    controller = module.get<AdminHackathonController>(AdminHackathonController);
  });

  afterEach(() => jest.clearAllMocks());

  // ───── POST /admin/hackathons ─────────────────────────────────────
  describe('POST /admin/hackathons', () => {
    it('should create a hackathon', async () => {
      mockAdminHackathonService.createHackathon.mockResolvedValue({ id: 'h1' });
      const dto = { name: 'HackFest 2025', startDate: '2025-01-01' } as any;
      const result = await controller.createHackathon(mockReq, dto);
      expect(mockAdminHackathonService.createHackathon).toHaveBeenCalledWith(
        'admin1',
        dto,
      );
      expect(result).toEqual({ id: 'h1' });
    });
  });

  // ───── GET /admin/hackathons ──────────────────────────────────────
  describe('GET /admin/hackathons', () => {
    it('should return hackathons for the authenticated admin', async () => {
      mockAdminHackathonService.getMyHackathons.mockResolvedValue([
        { id: 'h1' },
      ]);
      const result = await controller.getMyHackathons(mockReq);
      expect(mockAdminHackathonService.getMyHackathons).toHaveBeenCalledWith(
        'admin1',
      );
      expect(result).toHaveLength(1);
    });
  });

  // ───── GET /admin/hackathons/stats ────────────────────────────────
  describe('GET /admin/hackathons/stats', () => {
    it('should return aggregated stats for admin', async () => {
      mockAdminHackathonService.getStats.mockResolvedValue({
        total: 5,
        active: 2,
      });
      const result = await controller.getStats(mockReq);
      expect(result).toEqual({ total: 5, active: 2 });
    });
  });

  // ───── POST /admin/hackathons/:id/allocate-ps ─────────────────────
  describe('POST /admin/hackathons/:id/allocate-ps', () => {
    it('should allocate problem statements with default options', async () => {
      mockAdminHackathonService.allocateProblemStatements.mockResolvedValue({
        allocated: 10,
      });
      const result = await controller.allocatePS(mockReq, 'h1', {});
      expect(mockAdminHackathonService.allocateProblemStatements).toHaveBeenCalledWith(
        'admin1',
        'h1',
        {},
      );
      expect(result).toEqual({ allocated: 10 });
    });

    it('should allow optional maxTeamsPerDomain and minTeamsPerDomain', async () => {
      mockAdminHackathonService.allocateProblemStatements.mockResolvedValue({
        allocated: 6,
      });
      const dto = { maxTeamsPerDomain: 5, minTeamsPerDomain: 2 };
      await controller.allocatePS(mockReq, 'h1', dto);
      expect(mockAdminHackathonService.allocateProblemStatements).toHaveBeenCalledWith(
        'admin1',
        'h1',
        dto,
      );
    });

    it('should support dynamic capacities per domain', async () => {
      mockAdminHackathonService.allocateProblemStatements.mockResolvedValue({
        allocated: 3,
      });
      const dto = { dynamicCapacities: { domainA: 3, domainB: 5 } };
      await controller.allocatePS(mockReq, 'h1', dto);
      expect(mockAdminHackathonService.allocateProblemStatements).toHaveBeenCalledWith(
        'admin1',
        'h1',
        dto,
      );
    });
  });
});
