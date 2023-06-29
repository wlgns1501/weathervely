import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiModule } from './api/api.module';
import { ForecastModule } from './forecast/forecast.module';
import typeOrmConfig from 'ormconfig';

@Module({
  imports: [TypeOrmModule.forRoot(typeOrmConfig), ApiModule, ForecastModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
