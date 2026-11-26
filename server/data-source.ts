import 'dotenv/config';
import { DataSource } from 'typeorm';

// DataSource used by TypeORM CLI for migrations
export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: true,
    ca: process.env.DATABASE_CA?.replace(/\\n/g, '\n'),
  },
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
});
