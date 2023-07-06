import {
  Inject,
  Controller,
  Get,
  Query,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ForecastService } from './forecast.service';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { calculateMS } from '../../lib/utils/calculate';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

// 온보딩 : 위치 기준 어제 , 그저께 최저온도 , 최고온도 ( getWthrDataList() )
// 메인 : 현재온도 , 바람 , 날씨 -> 단기예보 -> 초단기예보 ( getUltraSrtFcst() )
// 메인 : 오늘 최저온도 , 최고온도 response => 단기예보 -> 단기예보 ( getVilageFcst() )
// 메인 -> 주간 예보 : 글피부터 최대 10일간의 최저온도 최고온도 제공 => 중기예보 -> 중기기온조회( getOpenForecastMidInfo() )

@ApiTags('Forcast')
@Controller('forecast')
export class ForecastController {
  constructor(
    private readonly forecastService: ForecastService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // 온보딩 - 체감온도 설정시
  @Get('getWthrDataList')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '기상청 데이터 리스트' })
  async getWthrDataList() {
    const data = await this.forecastService.getWthrDataList();
    return data;
  }

  @Get('getUltraSrtFcst')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '몰라' })
  async getUltraSrtFcst(
    @Query('location') location: string,
    @Query('x') x: string,
    @Query('y') y: string,
  ): Promise<any> {
    /* 
    flow 흐름 - start
    1. address_id를 받는다
    2. address 테이블 findOne
    3. city + gu : location
    4. x - 위도 , y - 경도
    5. 캐시 조회
    6. 없으면 api 조회
    7. response
    - end 
    */
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
        const milliSeconds = calculateMS(45); // api호출 시간 기준시 45분까지 남은 시간 milliSeconds로 변환
        await this.cacheManager.set(
          `UltraSrtFcst_${location}`,
          data,
          milliSeconds,
        );
      }

      return data;
    }
  }

  @Get('getVilageFcst')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '지역 기온 데이터' })
  async getVilageFcst() {
    const data = await this.forecastService.getVilageFcst();
    return data;
  }

  @Get('getMidTa')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '중간 데이터' })
  async getMidTa() {
    const data = await this.forecastService.getMidTa();
    return data;
  }
}
