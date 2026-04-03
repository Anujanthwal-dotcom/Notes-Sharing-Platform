import { COLLEGE_REPOSITORY, DATA_SOURCE } from '../../constant/constants';
import { DataSource } from 'typeorm';
import { College } from '../entities/college.entity';

export const collegeProvider = {
  provide: COLLEGE_REPOSITORY,
  useFactory: (datasource: DataSource) => datasource.getRepository(College),
  inject: [DATA_SOURCE],
};
