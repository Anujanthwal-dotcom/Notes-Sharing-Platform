// src/admin/admin.controller.ts
import { Controller, Get, Delete } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AnalyticsDto } from '../analytics/dto/analytics.dto';
// import { AdminGuard } from '../auth/admin.guard'; <-- CRITICAL

@Controller('admin')
// @UseGuards(AdminGuard) // You MUST protect this controller
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('analytics')
  async getAnalytics(): Promise<AnalyticsDto> {
    return this.adminService.getAnalytics();
  }

  @Delete('reset-application')
  async resetApplication(): Promise<{ message: string }> {
    return this.adminService.resetApplication();
  }
}
