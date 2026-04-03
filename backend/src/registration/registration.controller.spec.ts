import { Test, TestingModule } from '@nestjs/testing';
import { RegistrationController } from './registration.controller';
import { RegistrationService } from './registration.service';
import { AuthGuard } from '@nestjs/passport';

const mockRegistrationService = {
  createTeam: jest.fn(),
  joinTeam: jest.fn(),
  registerSolo: jest.fn(),
  getCommunity: jest.fn(),
  updateTeam: jest.fn(),
  deleteTeam: jest.fn(),
  inviteSoloUser: jest.fn(),
  finalizeTeam: jest.fn(),
};

const mockReq = { user: { userId: 'u1', email: 'u@u.com' } } as any;

describe('RegistrationController', () => {
  let controller: RegistrationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RegistrationController],
      providers: [
        { provide: RegistrationService, useValue: mockRegistrationService },
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue({ canActivate: () => true })
      .compile();
    controller = module.get<RegistrationController>(RegistrationController);
  });

  afterEach(() => jest.clearAllMocks());

  // ───── POST /registration/team ────────────────────────────────────
  describe('POST /registration/team', () => {
    it('should create a team for the authenticated user', async () => {
      mockRegistrationService.createTeam.mockResolvedValue({ id: 't1' });
      const dto = { teamName: 'Hackers', hackathonId: 'h1' } as any;
      const result = await controller.createTeam(mockReq, dto);
      expect(mockRegistrationService.createTeam).toHaveBeenCalledWith(
        'u1',
        'u@u.com',
        dto,
      );
      expect(result).toEqual({ id: 't1' });
    });
  });

  // ───── POST /registration/join ────────────────────────────────────
  describe('POST /registration/join', () => {
    it('should allow user to join a team', async () => {
      mockRegistrationService.joinTeam.mockResolvedValue({ joined: true });
      const dto = { teamCode: 'ABC123' } as any;
      const result = await controller.joinTeam(mockReq, dto);
      expect(result).toEqual({ joined: true });
    });
  });

  // ───── POST /registration/solo ────────────────────────────────────
  describe('POST /registration/solo', () => {
    it('should register user as solo participant', async () => {
      mockRegistrationService.registerSolo.mockResolvedValue({ solo: true });
      const dto = { hackathonId: 'h1' } as any;
      const result = await controller.registerSolo(mockReq, dto);
      expect(mockRegistrationService.registerSolo).toHaveBeenCalledWith(
        'u1',
        dto,
      );
      expect(result).toEqual({ solo: true });
    });
  });

  // ───── GET /registration/community/:hackathonId ───────────────────
  describe('GET /registration/community/:hackathonId', () => {
    it('should return community for hackathon', async () => {
      mockRegistrationService.getCommunity.mockResolvedValue([{ id: 't1' }]);
      const result = await controller.getCommunity('h1');
      expect(result).toEqual([{ id: 't1' }]);
    });
  });

  // ───── PUT /registration/team/:teamId ────────────────────────────
  describe('PUT /registration/team/:teamId', () => {
    it('should update team name', async () => {
      mockRegistrationService.updateTeam.mockResolvedValue({ name: 'NewName' });
      const result = await controller.updateTeam(mockReq, 't1', 'NewName');
      expect(mockRegistrationService.updateTeam).toHaveBeenCalledWith(
        'u1',
        't1',
        'NewName',
      );
      expect(result).toEqual({ name: 'NewName' });
    });
  });

  // ───── DELETE /registration/team/:teamId ─────────────────────────
  describe('DELETE /registration/team/:teamId', () => {
    it('should delete team', async () => {
      mockRegistrationService.deleteTeam.mockResolvedValue({ deleted: true });
      const result = await controller.deleteTeam(mockReq, 't1');
      expect(result).toEqual({ deleted: true });
    });
  });

  // ───── POST /registration/invite/:teamId/:userId ──────────────────
  describe('POST /registration/invite/:teamId/:userId', () => {
    it('should send invite to solo user', async () => {
      mockRegistrationService.inviteSoloUser.mockResolvedValue({ invited: true });
      const result = await controller.inviteSoloUser(mockReq, 't1', 'u2');
      expect(mockRegistrationService.inviteSoloUser).toHaveBeenCalledWith(
        'u1',
        't1',
        'u2',
      );
      expect(result).toEqual({ invited: true });
    });
  });

  // ───── PUT /registration/team/finalize/:teamId ────────────────────
  describe('PUT /registration/team/finalize/:teamId', () => {
    it('should finalize team', async () => {
      mockRegistrationService.finalizeTeam.mockResolvedValue({ finalized: true });
      const result = await controller.finalizeTeam(mockReq, 't1');
      expect(mockRegistrationService.finalizeTeam).toHaveBeenCalledWith(
        'u1',
        't1',
      );
      expect(result).toEqual({ finalized: true });
    });
  });
});
