import { Module } from '@nestjs/common';
import { CollegeService } from './college.service';
import { CollegeController } from './college.controller';
import { collegeProvider } from './providers/college.provider';
import { DatabaseModule } from '../database/database.module';

@Module({
  controllers: [CollegeController],
  providers: [CollegeService, collegeProvider],
  exports: [CollegeService],
  imports: [DatabaseModule],
})
export class CollegeModule {}
