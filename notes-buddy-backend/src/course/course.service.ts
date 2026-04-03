import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { COURSE_REPOSITORY } from '../constant/constants';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';

@Injectable()
export class CourseService {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: Repository<Course>,
  ) {}

  async saveCourse(course: string) {
    try {
      const existingCollege = await this.courseRepository.findOne({
        where: {
          course: course,
        },
      });

      if (existingCollege) {
        return existingCollege;
      }
      return await this.courseRepository.save({
        course,
      });
    } catch (error) {
      throw new InternalServerErrorException('Error in saving course.');
    }
  }

  async getCourse(course: string) {
    return await this.courseRepository.findOne({
      where: {
        course: course,
      },
    });
  }

  async getAllCourses() {
    return await this.courseRepository.find();
  }
}
