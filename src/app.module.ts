import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './v1/auth/auth.module';
import { TypeOrmConfigService } from 'ormconfig';
import { ConfigModule } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { ForecastModule } from './v1/forecast/forecast.module';
import { ClosetModule } from './v1/closet/closet.module';
import { TypeModule } from './v1/type/type.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
      dataSourceFactory: async (
        options?: DataSourceOptions,
      ): Promise<DataSource> => {
        if (!options) throw new Error('options is undefined');
        return addTransactionalDataSource({
          dataSource: new DataSource(options),
        });
      },
    }),
    AuthModule,
    ForecastModule,
    ClosetModule,
    TypeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
