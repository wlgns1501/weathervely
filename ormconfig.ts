import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  autoLoadEntities: true,
  synchronize: true,
  logging: true,
  entities: ['dist/src/entities/**/*{.js,.ts}'],
  migrations: ['dist/migration/**/*{.js,.ts}'],
  subscribers: ['dist/subscribers/**/*{.js,.ts}'],
};

export default typeOrmConfig;
