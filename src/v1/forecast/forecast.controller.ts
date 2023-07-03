import { Inject, Controller, Get, Query } from '@nestjs/common';
import { ForecastService } from './forecast.service';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { calculateMS } from '../../lib/utils/calculate';
@Controller('forecast')
export class ForecastController {
  // 메인 : 현재온도 , 바람 , 날씨 -> 단기예보 -> 초단기예보 ( getUltraSrtFcst() )
  // // 온보딩 : 위치 기준 어제 , 그저께 최저온도 , 최고온도 ( getWthrDataList() )
  // 메인 : 오늘 최저온도 , 최고온도 response => 단기예보 -> 단기예보 ( getUltraSrtFcst() )
  // 메인 -> 주간 예보 : 오늘로부터 최대 10일간의 최저온도 최고온도 제공 => 중기예보 -> 중기기온조회( getOpenForecastMidInfo() )
  constructor(
    private readonly forecastService: ForecastService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // 온보딩 - 체감온도 설정시
  @Get('getWthrDataList')
  async getWthrDataList() {
    const data = await this.forecastService.getWthrDataList();
    return data;
  }

  @Get('getVilageFcst')
  async getVilageFcst() {
    const data = await this.forecastService.getVilageFcst();
    return data;
  }

  @Get('getUltraSrtFcst')
  async getUltraSrtFcst(
    @Query('location') location: string,
    @Query('x') x: string,
    @Query('y') y: string,
  ): Promise<any> {
    /*  
    ! Question - 구(읍/면) 단위로 조회할지, 동 단위로 조회할지?
      - 구(읍/면) 단위로 조회시
        1. 동 보다 범위가 커서 api 콜횟수를 줄일수있음.
        2. 유저 온보딩시 동네단위로 지역설정을 하기때문에 구(읍/면)로 조회하는게 괜찮은가 의문.
        3. 동별로 날씨차이가 크게 없기때문에 구(읍/면) 단위로 조회해도 괜찮지않을까..? 
    */
    /* 
    flow 흐름 - start
    1. address_id를 받는다
    2. address 테이블 findOne
    3. gu or dong : location
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

  @Get('getOpenForecastMidInfo')
  async getOpenForecastMidInfo() {
    const data = await this.forecastService.getOpenForecastMidInfo();
    return data;
  }
}
