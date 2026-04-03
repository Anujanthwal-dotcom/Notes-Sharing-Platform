import { COURSE_REPOSITORY, DATA_SOURCE } from '../../constant/constants';
import { DataSource } from 'typeorm';
import { Course } from '../entities/course.entity';

export const courseProvider = {
  provide: COURSE_REPOSITORY,
  useFactory: (datasource: DataSource) => datasource.getRepository(Course),
  inject: [DATA_SOURCE],
};
