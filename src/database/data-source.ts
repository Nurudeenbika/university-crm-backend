import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import configuration from '../config/configuration';

const config = configuration();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.name,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
  subscribers: ['src/**/*.subscriber.ts'],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
});

// ormconfig.json alternative for CLI commands
export default AppDataSource;
