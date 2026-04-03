import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UnauthorizedException } from '@nestjs/common';

const mockAdminService = {
  getUsers: jest.fn(),
  createUser: jest.fn(),
  updateUserStatus: jest.fn(),
  updateUserRole: jest.fn(),
  getParticipants: jest.fn(),
  getStatsOverview: jest.fn(),
};

const adminReq = { user: { role: 'ADMIN' }, headers: {} } as any;
const nonAdminReq = { user: { role: 'USER' }, headers: {} } as any;

describe('AdminController', () => {
  let controller: AdminController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [{ provide: AdminService, useValue: mockAdminService }],
    }).compile();
    controller = module.get<AdminController>(AdminController);
  });

  afterEach(() => jest.clearAllMocks());

  // ───── GET /api/admin/users ───────────────────────────────────────
  describe('GET /api/admin/users', () => {
    it('should return users for ADMIN role', async () => {
      mockAdminService.getUsers.mockResolvedValue([{ id: '1' }]);
      const result = await controller.getUsers(adminReq);
      expect(result).toEqual([{ id: '1' }]);
    });

    it('should throw UnauthorizedException for non-admin', async () => {
      await expect(controller.getUsers(nonAdminReq)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should use x-user-role header if user object missing', async () => {
      mockAdminService.getUsers.mockResolvedValue([]);
      const req = { user: undefined, headers: { 'x-user-role': 'ADMIN' } } as any;
      const result = await controller.getUsers(req);
      expect(result).toEqual([]);
    });
  });

  // ───── POST /api/admin/users ──────────────────────────────────────
  describe('POST /api/admin/users', () => {
    it('should create user for ADMIN', async () => {
      mockAdminService.createUser.mockResolvedValue({ id: 'new' });
      const dto = { email: 'x@x.com', role: 'JUDGE' } as any;
      const result = await controller.createUser(dto, adminReq);
      expect(result).toEqual({ id: 'new' });
    });

    it('should throw UnauthorizedException for non-admin', async () => {
      await expect(
        controller.createUser({ email: 'x@x.com' } as any, nonAdminReq),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  // ───── PATCH /api/admin/users/:userId/status ─────────────────────
  describe('PATCH /api/admin/users/:userId/status', () => {
    it('should update user status for ADMIN', async () => {
      mockAdminService.updateUserStatus.mockResolvedValue({ status: 'ACTIVE' });
      const result = await controller.toggleStatus('u1', 'ACTIVE', adminReq);
      expect(mockAdminService.updateUserStatus).toHaveBeenCalledWith('u1', 'ACTIVE');
      expect(result).toEqual({ status: 'ACTIVE' });
    });

    it('should throw UnauthorizedException for non-admin', async () => {
      await expect(
        controller.toggleStatus('u1', 'ACTIVE', nonAdminReq),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  // ───── PATCH /api/admin/users/:userId/role ────────────────────────
  describe('PATCH /api/admin/users/:userId/role', () => {
    it('should update user role for ADMIN', async () => {
      mockAdminService.updateUserRole.mockResolvedValue({ role: 'JUDGE' });
      const result = await controller.changeRole('u1', 'JUDGE', adminReq);
      expect(result).toEqual({ role: 'JUDGE' });
    });

    it('should throw UnauthorizedException for non-admin', async () => {
      await expect(
        controller.changeRole('u1', 'JUDGE', nonAdminReq),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  // ───── GET /api/admin/participants ────────────────────────────────
  describe('GET /api/admin/participants', () => {
    it('should return participants for ADMIN', async () => {
      mockAdminService.getParticipants.mockResolvedValue([{ id: 'p1' }]);
      const result = await controller.getParticipants(adminReq);
      expect(result).toEqual([{ id: 'p1' }]);
    });

    it('should throw UnauthorizedException for non-admin', async () => {
      await expect(controller.getParticipants(nonAdminReq)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  // ───── GET /api/admin/stats/overview ─────────────────────────────
  describe('GET /api/admin/stats/overview', () => {
    it('should return stats overview for ADMIN', async () => {
      mockAdminService.getStatsOverview.mockResolvedValue({ total: 10 });
      const result = await controller.getStatsOverview(adminReq);
      expect(result).toEqual({ total: 10 });
    });

    it('should throw UnauthorizedException for non-admin', async () => {
      await expect(controller.getStatsOverview(nonAdminReq)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
