import { Test, TestingModule } from '@nestjs/testing';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { AuthGuard } from '@nestjs/passport';

const mockStudentService = {
  getStudentScore: jest.fn(),
  getStudentMeals: jest.fn(),
};

const mockReq = { user: { userId: 'u1', email: 'u@u.com' } } as any;

describe('StudentController', () => {
  let controller: StudentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentController],
      providers: [{ provide: StudentService, useValue: mockStudentService }],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue({ canActivate: () => true })
      .compile();
    controller = module.get<StudentController>(StudentController);
  });

  afterEach(() => jest.clearAllMocks());

  // ───── GET /api/student/score ─────────────────────────────────────
  describe('GET /api/student/score', () => {
    it('should return score for authenticated student', async () => {
      mockStudentService.getStudentScore.mockResolvedValue({ score: 82 });
      const result = await controller.getStudentScore(mockReq);
      expect(mockStudentService.getStudentScore).toHaveBeenCalledWith('u1');
      expect(result).toEqual({ score: 82 });
    });

    it('should propagate error if user has no score', async () => {
      mockStudentService.getStudentScore.mockRejectedValue(new Error('No score'));
      await expect(controller.getStudentScore(mockReq)).rejects.toThrow('No score');
    });
  });

  // ───── GET /api/student/meals ─────────────────────────────────────
  describe('GET /api/student/meals', () => {
    it('should return meal info for authenticated student', async () => {
      mockStudentService.getStudentMeals.mockResolvedValue([
        { meal: 'lunch', used: true },
      ]);
      const result = await controller.getStudentMeals(mockReq);
      expect(mockStudentService.getStudentMeals).toHaveBeenCalledWith('u1');
      expect(result).toHaveLength(1);
    });
  });
});
