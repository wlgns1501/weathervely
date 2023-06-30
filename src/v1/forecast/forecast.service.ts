import { Injectable } from '@nestjs/common';
import { AxiosInstance } from 'axios';
import { createPublicApiAxiosInstance } from '../../lib/config/axios.config';
import {
  dfsXyConvert,
  getWeatherState,
  getBaseDateTime,
} from '../../lib/utils/publicForecast';

@Injectable()
export class ForecastService {
  private readonly axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = createPublicApiAxiosInstance();
  }

  /* 초단기예보 : 메인
  T1H - 기온 - 현재기온 : 섭씨온도
  RN1 - 1시간 강수량 - 현재 비오는지 and 강수량 : mm
  REH - 습도 - 현재 습도 : %
  PTY - 강수형태 - 코드값 : 없음(0) , 비(1) , 비/눈(2) , 눈(3) , 빗방울(5) , 빗방울눈날림(6) , 눈날림(7)
  WSD - 풍속 - 바람세기 : m/s
  UUU - 동서바람성분
  VVV - 남북바람성분
  VEC - 풍향
  // 초단기예보 전용
  SKY - 하늘상태 - 코드값 : 맑음(1) , 구름많음(3) , 흐림(4)
  LGT - 낙뢰 
  */
  // test : 서울 성북구 위도 경도 - 37.58638333 , 127.0203333
  async getUltraSrtFcst<T>(x: number, y: number): Promise<T> {
    const xyObj = dfsXyConvert('TO_GRID', x, y);
    const response = await this.axiosInstance.get(
      `/VilageFcstInfoService_2.0/getUltraSrtFcst`,
      {
        params: {
          ...getBaseDateTime(),
          nx: xyObj.x,
          ny: xyObj.y,
        },
      },
    );

    const temp = response.data.response.body.items.item
      .filter(
        (it) =>
          it.category === 'SKY' ||
          it.category === 'T1H' ||
          it.category === 'RN1' ||
          it.category === 'REH' ||
          it.category === 'PTY' ||
          it.category === 'WSD',
      )
      .map((it) => {
        return {
          category: it.category,
          value: it.fcstValue,
          dateTime: it.fcstTime,
        };
      });
    console.log(temp);
    return response.data.response?.body;
  }

  // 중기예보 : 온보딩 - 최저 , 최고기온 || 10일간 예보 화면
  async getOpenForecastMidInfo() {
    const response = await this.axiosInstance.get(
      `/MidFcstInfoService/getMidTa`,
      {
        params: {
          regId: '11B10101',
          tmFc: '202306290600',
        },
      },
    );

    return response.data.response?.body;
  }

  /* 초단기실황 : 안쓰이나? */
  async getUltraSrtNcst() {
    const response = await this.axiosInstance.get(
      `/VilageFcstInfoService_2.0/getUltraSrtNcst`,
      {
        params: {
          ...getBaseDateTime(),
          nx: 55, // 계산
          ny: 127, // 계산
        },
      },
    );

    return response.data.response?.body;
  }
}
