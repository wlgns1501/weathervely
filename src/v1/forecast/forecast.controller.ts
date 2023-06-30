import { Inject, Controller, Get, Query } from '@nestjs/common';
import { ForecastService } from './forecast.service';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { calculateMS } from '../../lib/utils/calculate';
@Controller('forecast')
export class ForecastController {
  constructor(
    private readonly forecastService: ForecastService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Get('getUltraSrtNcst')
  async getUltraSrtNcst() {
    const data = await this.forecastService.getUltraSrtNcst();
    return data.items.item;
  }

  @Get('getUltraSrtFcst')
  async getUltraSrtFcst(
    @Query('location') location: string,
    @Query('x') x: string,
    @Query('y') y: string,
  ): Promise<any> {
    // 같은구에 조회가 들어올때
    const cacheData: any | null = await this.cacheManager.get(
      `UltraSrtFcst_${location}`,
    );
    if (cacheData) {
      return cacheData;
    } else {
      const data = await this.forecastService.getUltraSrtFcst<any>(
        parseFloat(x),
        parseFloat(y),
      );

      if (location) {
        const milliSeconds = calculateMS(45);
        await this.cacheManager.set(
          `UltraSrtFcst_${location}`,
          data.items.item,
          milliSeconds,
        );
      }

      return data.items.item;
    }
  }

  @Get('getOpenForecastMidInfo')
  async getOpenForecastMidInfo() {
    const data = await this.forecastService.getOpenForecastMidInfo();
    return data.items.item;
  }
}
