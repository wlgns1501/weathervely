import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

// const typeOrmConfig: TypeOrmModuleOptions = {
//   type: 'mysql',
//   host: process.env.DB_HOST,
//   port: parseInt(process.env.DB_PORT),
//   username: process.env.DB_USERNAME,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_DATABASE,
//   autoLoadEntities: true,
//   synchronize: false,
//   logging: true,
//   entities: ['dist/src/entities/**/*{.js,.ts}'],
//   migrations: ['dist/migration/**/*{.js,.ts}'],
//   subscribers: ['dist/subscribers/**/*{.js,.ts}'],
// };

// export default typeOrmConfig;

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'mysql',
      host: this.configService.get('DB_HOST'),
      port: parseInt(this.configService.get('DB_PORT')),
      username: this.configService.get('DB_USERNAME'),
      password: this.configService.get('DB_PASSWORD'),
      database: this.configService.get('DB_DATABASE'),
      synchronize: true,
      autoLoadEntities: true,
      logging: true,
      entities: ['dist/src/entities/**/*{.js,.ts}'],
      migrations: ['dist/migration/**/*{.js,.ts}'],
      subscribers: ['dist/subscribers/**/*{.js,.ts}'],
    } as TypeOrmModuleOptions;
  }
}
