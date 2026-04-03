import { Controller, Get } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsDto } from './dto/analytics.dto';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('get-analytics')
  async getAnalytics(): Promise<AnalyticsDto> {
    return this.analyticsService.get();
  }
}
