import { DataSource } from 'typeorm';
import { seedDefaultUsers } from './seeds/default-users.seed';
import { seedSampleCourses } from './seeds/sample-courses.seed';
import configuration from '../config/configuration';

async function runSeeds() {
  const config = configuration();

  const dataSource = new DataSource({
    type: 'postgres',
    host: config.database.host,
    port: config.database.port,
    username: config.database.username,
    password: config.database.password,
    database: config.database.name,
    entities: ['dist/**/*.entity.js'],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('Data Source has been initialized!');

    await seedDefaultUsers(dataSource);
    await seedSampleCourses(dataSource);

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await dataSource.destroy();
  }
}

runSeeds();
