import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { StudentService } from './student.service';
import { AuthGuard } from '@nestjs/passport';

interface RequestWithUser {
  user: { userId: string; email: string };
}

@Controller('api/student')
@UseGuards(AuthGuard('jwt'))
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get('score')
  getStudentScore(@Req() req: RequestWithUser) {
    return this.studentService.getStudentScore(req.user.userId);
  }

  @Get('meals')
  getStudentMeals(@Req() req: RequestWithUser) {
    return this.studentService.getStudentMeals(req.user.userId);
  }
}
