import { DataSource } from 'typeorm';
import { DATA_SOURCE } from '../constant/constants';

export const databaseProviders = [
  {
    provide: DATA_SOURCE,
    useFactory: async () => {
      const dataSource = new DataSource({
        type: 'postgres',
        host: process.env.POSTGRES_HOST,
        port: parseInt(process.env.POSTGRES_PORT || ''),
        username: String(process.env.POSTGRES_USER),
        password: String(process.env.POSTGRES_PASS),
        database: process.env.POSTGRES_DB,
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: true,
      });

      return dataSource.initialize();
    },
  },
];
