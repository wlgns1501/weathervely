import { Injectable } from '@nestjs/common';
import { AxiosInstance } from 'axios';
import { createPublicApiAxiosInstance } from '../../lib/config/axios.config';
import {
  dfsXyConvert,
  getWeatherState,
  getBaseDateTime,
  getRoundedHour,
  formatTime,
} from '../../lib/utils/publicForecast';
import { User } from 'src/entities/user.entity';
import { Address } from 'src/entities/address.entity';
import { ClosetRepository } from 'src/repositories/closet.repository';
import { UserPickStyleRepository } from 'src/repositories/user_pick_style.repository';

@Injectable()
export class ClosetService {
  private readonly axiosInstance: AxiosInstance;

  constructor(
    private readonly closetRepository: ClosetRepository,
    private readonly userPickStyleRepository: UserPickStyleRepository,
  ) {
    this.axiosInstance = createPublicApiAxiosInstance();
  }

  async getRecommendCloset(dateTime: string, address: Address) {
    // body - 어제 or 오늘 , 시간대
    // 기상청 api call -> response 데이터로 T1H 가져오기 ( 기온 - 어제 or 오늘 )
    // 각tmp로 룩 테이블 조회
    const { x_code, y_code } = address;
    const xyObj = dfsXyConvert('TO_GRID', x_code, y_code);
    const targetDateTime = new Date(dateTime);

    const response = await this.axiosInstance.get(
      `/VilageFcstInfoService_2.0/getUltraSrtFcst`,
      {
        params: {
          ...getBaseDateTime(
            {
              minutes: 30,
              provide: 45,
            },
            targetDateTime.getTime(),
          ),
          nx: xyObj.x,
          ny: xyObj.y,
        },
      },
    );

    const apiData =
      response.data.response.body?.items?.item.filter(
        (it) =>
          it.fcstTime === formatTime(targetDateTime.getHours()) &&
          it.category === 'T1H', // 기온
      ) ?? [];

    const { fcstValue } = apiData[0];
    console.log(fcstValue);
    // this.getCloset(fcstValue);
    return apiData;
  }

  async getCloset(temperature: number, user: User) {
    const userPickStyle = await this.userPickStyleRepository.getOrderStyle(
      user,
    );

    const sorted = Object.entries(userPickStyle)
      .filter(([key]) => {
        return key !== 'id';
      })
      .sort((a, b) => b[1] - a[1])
      .map((it) => {
        return it[0];
      });

    const closets = await this.closetRepository.getCloset(temperature);
    for (let i = 0; i < sorted?.length; i++) {
      const arr_closets = closets.filter((it) => it.typeName === sorted[i]);
      if (arr_closets.length > 0) {
        const random_num = Math.floor(Math.random() * arr_closets.length);
        return arr_closets[random_num];
      }
    }

    // 예외 1. 온도를 포함하는 옷이 없을때 - 정책 수립 필요

    // return result;
  }
}
