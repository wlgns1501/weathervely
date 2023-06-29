import { Controller, Get } from '@nestjs/common';
import { ApiService } from '../api/api.service';

@Controller('forecast')
export class ForecastController {
  constructor(private readonly apiService: ApiService) {}

  @Get('getOpenForecastShortInfo')
  async getOpenForecastShortInfo() {
    const data = await this.apiService.getOpenForecastShortInfo();
    return data.items.item;
  }

  @Get('getOpenForecastMidInfo')
  async getOpenForecastMidInfo() {
    const data = await this.apiService.getOpenForecastMidInfo();
    return data.items.item;
  }
}
