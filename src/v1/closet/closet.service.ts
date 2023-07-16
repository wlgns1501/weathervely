import { HttpException, HttpStatus, Injectable, Inject } from '@nestjs/common';
import { User } from 'src/entities/user.entity';
import { ClosetRepository } from 'src/repositories/closet.repository';
import { Transactional } from 'typeorm-transactional';
import { PickClosetDto } from './dtos/pickCloset.dto';
import { UserSetStyleRepository } from 'src/repositories/user_set_style.repository';
import { MYSQL_ERROR_CODE } from 'src/lib/constant/mysqlError';
import { HTTP_ERROR } from 'src/lib/constant/httpError';
import { AxiosInstance } from 'axios';
import { createPublicApiAxiosInstance } from '../../lib/config/axios.config';
import {
  dfsXyConvert,
  getWeatherState,
  getBaseDateTime,
  getRoundedHour,
  formatTime,
} from '../../lib/utils/publicForecast';
import { Address } from 'src/entities/address.entity';
import { UserPickStyleRepository } from 'src/repositories/user_pick_style.repository';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { calculateMS } from 'src/lib/utils/calculate';

@Injectable()
export class ClosetService {
  private readonly axiosInstance: AxiosInstance;
  constructor(
    private readonly closetRepository: ClosetRepository,
    private readonly userSetStyleRepository: UserSetStyleRepository,
    private readonly userPickStyleRepository: UserPickStyleRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.axiosInstance = createPublicApiAxiosInstance();
  }

  async getClosetList() {
    const closets = await this.closetRepository.getClosetList();

    return closets;
  }

  @Transactional()
  async pickCloset(pickClosetDto: PickClosetDto, user: User) {
    const { closet_ids } = pickClosetDto;

    if (closet_ids.length !== 0)
      try {
        for (const closet_id of closet_ids) {
          const closet = await this.closetRepository.getClosetById(closet_id);

          await this.userSetStyleRepository.setUserStyle(closet, user);
        }
      } catch (err) {
        switch (err.errno) {
          case MYSQL_ERROR_CODE.DUPLICATED_KEY:
            throw new HttpException(
              {
                message: HTTP_ERROR.DUPLICATED_KEY_ERROR,
                detail: '이미 선택한 style 입니다.',
              },
              HttpStatus.BAD_REQUEST,
            );
        }
      }
  }

  // array
  async getRecommendCloset(dateTime: string, address: Address, user: User) {
    const { city, x_code, y_code } = address;
    const cacheData: any | null = await this.cacheManager.get(
      `UltraSrtFcst_${city}_${dateTime}`,
    );
    let fcstValue: number;
    if (cacheData) {
      fcstValue = cacheData;
    } else {
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
      console.log('@@@response@@@', response.data.response);
      const apiData = getTemperatureData(
        response.data.response.body?.items?.item,
        targetDateTime,
      );

      fcstValue = apiData.fcstValue;
      const milliSeconds = calculateMS(2880);
      console.log(milliSeconds);
      await this.cacheManager.set(
        `UltraSrtFcst_${city}_${dateTime}`,
        fcstValue,
        milliSeconds,
      );
    }
    console.log('fcstValue', fcstValue);
    const closet = await this.closetRepository.getRecommendClosetByTemperature(
      fcstValue,
      user,
    );

    return {
      ...closet,
      fcstValue,
    };
  }

  async setRecommendCloset() {
    return {
      code: 200,
      msg: 'ok',
    };
  }

  //   // 단일
  //   async getCloset(temperature: number, user: User) {
  //     const userPickStyle = await this.userPickStyleRepository.getOrderStyle(
  //       user,
  //     );

  //     const sortedStyles = Object.entries(userPickStyle)
  //       .filter(([key]) => {
  //         return key !== 'id';
  //       })
  //       .sort((a, b) => b[1] - a[1])
  //       .map((it) => {
  //         return it[0];
  //       });

  //     const closets = await this.closetRepository.getCloset(temperature);
  //     for (const style of sortedStyles) {
  //       const filteredClosets = filterClosetsByType(closets, style);
  //       if (filteredClosets.length > 0) {
  //         const randomIndex = getRandomIndex(filteredClosets.length);
  //         return filteredClosets[randomIndex];
  //       }
  //     }

  //     // 예외 1. 온도를 포함하는 옷이 없을때 - 정책 수립 필요 - 데이터적으로 이런 예외가 발생하지않게 하겠다고 답받음
  //     // return result;
  //   }
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
