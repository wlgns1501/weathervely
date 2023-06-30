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

  async getUltraSrtNcst() {
    const response = await this.axiosInstance.get(
      `/VilageFcstInfoService_2.0/getUltraSrtNcst`,
      {
        params: {
          ...getBaseDateTime(),
          // base_date: '20230629', // 백엔드
          // base_time: '0900', // 백엔드
          nx: 55, // 계산
          ny: 127, // 계산
        },
      },
    );

    return response.data.response?.body;
  }

  async getUltraSrtFcst() {
    console.log(getBaseDateTime());
    const response = await this.axiosInstance.get(
      `/VilageFcstInfoService_2.0/getUltraSrtFcst`,
      {
        params: {
          ...getBaseDateTime(),
          // base_date: '20230628', // 백엔드
          // base_time: '2130', // 백엔드
          nx: 55, // 계산
          ny: 127, // 계산
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
        };
      });
    console.log(temp);
    return response.data.response?.body;
  }

  // 중기예보
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
}
