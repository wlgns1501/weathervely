import { Controller, Get } from '@nestjs/common';
import { ForecastService } from './forecast.service';

@Controller('forecast')
export class ForecastController {
  constructor(private readonly forecastService: ForecastService) {}

  @Get('getUltraSrtNcst')
  async getUltraSrtNcst() {
    const data = await this.forecastService.getUltraSrtNcst();
    return data.items.item;
  }

  @Get('getUltraSrtFcst')
  async getUltraSrtFcst() {
    const data = await this.forecastService.getUltraSrtFcst();
    return data.items.item;
  }

  @Get('getOpenForecastMidInfo')
  async getOpenForecastMidInfo() {
    const data = await this.forecastService.getOpenForecastMidInfo();
    return data.items.item;
  }
}
