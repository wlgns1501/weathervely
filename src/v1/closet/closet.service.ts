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

  async getRecommendCloset(dateTime: string, address: Address, user: User) {
    // body - 어제 or 오늘 , 시간대
    // 기상청 api call -> response 데이터로 T1H 가져오기 ( 기온 - 어제 or 오늘 )
    // 각tmp로 룩 테이블 조회
    const { x_code, y_code } = address;
    const { x, y } = dfsXyConvert('TO_GRID', x_code, y_code);
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
          nx: x,
          ny: y,
        },
      },
    );

    const apiData = getTemperatureData(
      response.data.response.body?.items?.item,
      targetDateTime,
    );
    const { fcstValue } = apiData;
    const closet = await this.getCloset(fcstValue, user);
    return {
      ...closet,
      fcstValue,
    };
  }

  async getCloset(temperature: number, user: User) {
    const userPickStyle = await this.userPickStyleRepository.getOrderStyle(
      user,
    );

    const sortedStyles = Object.entries(userPickStyle)
      .filter(([key]) => {
        return key !== 'id';
      })
      .sort((a, b) => b[1] - a[1])
      .map((it) => {
        return it[0];
      });

    const closets = await this.closetRepository.getCloset(temperature);
    for (const style of sortedStyles) {
      const filteredClosets = filterClosetsByType(closets, style);
      if (filteredClosets.length > 0) {
        const randomIndex = getRandomIndex(filteredClosets.length);
        return filteredClosets[randomIndex];
      }
    }

    // 예외 1. 온도를 포함하는 옷이 없을때 - 정책 수립 필요
    // return result;
  }
}

function getTemperatureData(items: any[], targetDateTime: Date) {
  const formattedTime = formatTime(targetDateTime.getHours());
  const apiData =
    items?.filter((item) => {
      return item.fcstTime === formattedTime && item.category === 'T1H'; // Temperature
    }) || [];

  return apiData[0];
}

function filterClosetsByType(closets: any[], type: string) {
  return closets.filter((closet) => closet.typeName === type);
}

function getRandomIndex(max: number) {
  return Math.floor(Math.random() * max);
}
