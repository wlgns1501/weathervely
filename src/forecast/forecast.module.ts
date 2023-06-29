import { Module } from '@nestjs/common';
import { ForecastController } from './forecast.controller';
import { ApiService } from '../api/api.service';

@Module({
  providers: [ApiService],
  controllers: [ForecastController],
})
export class ForecastModule {}
