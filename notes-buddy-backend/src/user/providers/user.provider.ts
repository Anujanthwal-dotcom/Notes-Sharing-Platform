import { DATA_SOURCE, USER_REPOSITORY } from '../../constant/constants';
import { DataSource } from 'typeorm';
import { User } from '../entities/user.entity';

export const userProvider = {
  provide: USER_REPOSITORY,
  useFactory: (datasource: DataSource) => datasource.getRepository(User),
  inject: [DATA_SOURCE],
};
