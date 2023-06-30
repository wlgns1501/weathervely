import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ForecastModule } from './v1/forecast/forecast.module';
import typeOrmConfig from 'ormconfig';

@Module({
  imports: [TypeOrmModule.forRoot(typeOrmConfig), ForecastModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
