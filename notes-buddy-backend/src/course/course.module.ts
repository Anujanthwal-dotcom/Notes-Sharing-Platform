import { Module } from '@nestjs/common';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { DatabaseModule } from '../database/database.module';
import { courseProvider } from './providers/course.provider';

@Module({
  controllers: [CourseController],
  providers: [CourseService, courseProvider],
  imports: [DatabaseModule],
  exports: [CourseService],
})
export class CourseModule {}
