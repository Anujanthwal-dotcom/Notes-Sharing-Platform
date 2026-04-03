import { DATA_SOURCE, NOTE_REPOSITORY } from '../../constant/constants';
import { DataSource } from 'typeorm';
import { Note } from '../entities/note.entity';

export const noteProvider = {
  provide: NOTE_REPOSITORY,
  useFactory: (datasource: DataSource) => datasource.getRepository(Note),
  inject: [DATA_SOURCE],
};
