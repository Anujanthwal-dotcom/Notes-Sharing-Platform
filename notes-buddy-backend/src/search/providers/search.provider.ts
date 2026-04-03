import { DATA_SOURCE, SEARCH_REPOSITORY } from '../../constant/constants';
import { DataSource } from 'typeorm';
import { Search } from '../entities/search.entity';

export const searchProvider = {
  provide: SEARCH_REPOSITORY,
  useFactory: (datasource: DataSource) => datasource.getRepository(Search),
  inject: [DATA_SOURCE],
};
