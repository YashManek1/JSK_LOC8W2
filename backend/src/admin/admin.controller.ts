import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UnauthorizedException,
  Req,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { Request } from 'express';
import { CreateUserDto } from './dto/create-user.dto';

interface RequestWithUser extends Request {
  user?: { sub?: string; role?: string };
}

@Controller('api/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  async getUsers(@Req() req: RequestWithUser) {
    const role = req.user?.role || (req.headers['x-user-role'] as string);
    if (role !== 'ADMIN') {
      throw new UnauthorizedException('Admin access required');
    }
    return this.adminService.getUsers();
  }

  @Post('users')
  async createUser(@Body() dto: CreateUserDto, @Req() req: RequestWithUser) {
    const role = req.user?.role || (req.headers['x-user-role'] as string);
    if (role !== 'ADMIN') {
      throw new UnauthorizedException('Admin access required');
    }
    return this.adminService.createUser(dto);
  }

  @Patch('users/:userId/status')
  async toggleStatus(
    @Param('userId') userId: string,
    @Body('status') status: string,
    @Req() req: RequestWithUser,
  ) {
    const role = req.user?.role || (req.headers['x-user-role'] as string);
    if (role !== 'ADMIN') {
      throw new UnauthorizedException('Admin access required');
    }
    return this.adminService.updateUserStatus(userId, status);
  }

  @Patch('users/:userId/role')
  async changeRole(
    @Param('userId') userId: string,
    @Body('role') targetRole: string,
    @Req() req: RequestWithUser,
  ) {
    const role = req.user?.role || (req.headers['x-user-role'] as string);
    if (role !== 'ADMIN') {
      throw new UnauthorizedException('Admin access required');
    }
    return this.adminService.updateUserRole(userId, targetRole);
  }

  @Get('participants')
  async getParticipants(@Req() req: RequestWithUser) {
    const role = req.user?.role || (req.headers['x-user-role'] as string);
    if (role !== 'ADMIN') {
      throw new UnauthorizedException('Admin access required');
    }
    return this.adminService.getParticipants();
  }

  @Get('stats/overview')
  async getStatsOverview(@Req() req: RequestWithUser) {
    const role = req.user?.role || (req.headers['x-user-role'] as string);
    if (role !== 'ADMIN') {
      throw new UnauthorizedException('Admin access required');
    }
    return this.adminService.getStatsOverview();
  }
}
