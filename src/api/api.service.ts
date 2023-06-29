import { Injectable } from '@nestjs/common';
import { publicApiAxiosInstance } from './axios';

@Injectable()
export class ApiService {
  // 단기예보
  async getOpenForecastShortInfo() {
    const response = await publicApiAxiosInstance.get(
      `/VilageFcstInfoService_2.0/getUltraSrtNcst`,
      {
        params: {
          base_date: '20230629', // 백엔드
          base_time: '0900', // 백엔드
          nx: 55, // 계산
          ny: 127, // 계산
        },
      },
    );

    return response.data.response?.body;
  }

  // 중기예보
  async getOpenForecastMidInfo() {
    const response = await publicApiAxiosInstance.get(
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
