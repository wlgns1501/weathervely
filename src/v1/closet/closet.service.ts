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
  getCurrentDateTime,
  getVilageFcstBaseTime,
  padNumber,
  getYesterdayBaseDate,
} from '../../lib/utils/publicForecast';
import { Address } from 'src/entities/address.entity';
import { UserPickStyleRepository } from 'src/repositories/user_pick_style.repository';
import { UserPickWeatherRepository } from 'src/repositories/user_pick_weather.repository';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { calculateMS } from 'src/lib/utils/calculate';
import { SetRecommendClosetDto } from './dtos/setRecommendCloset.dto';
import { GetRecommendClosetDto } from './dtos/getRecommendCloset.dto';
import { GetClosetByTemperatureDto } from './dtos/getClosetByTemperature.dto';

@Injectable()
export class ClosetService {
  private readonly axiosInstance: AxiosInstance;
  constructor(
    private readonly closetRepository: ClosetRepository,
    private readonly userSetStyleRepository: UserSetStyleRepository,
    private readonly userPickStyleRepository: UserPickStyleRepository,
    private readonly userPickWeatherRepository: UserPickWeatherRepository,
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

  async getClosetByTemperature(
    GetClosetByTemperatureDto: GetClosetByTemperatureDto,
    user: User,
    address: Address,
  ) {
    try {
      // use 초단기예보 API
      const { dateTime } = GetClosetByTemperatureDto;
      const targetDateTime = new Date(dateTime);
      const targetDate = getTargetDate(targetDateTime);
      const targetTime = getTargetTime(targetDateTime);
      const { city, x_code, y_code } = address;
      const cacheData: any | null = await this.cacheManager.get(
        `UltraSrtFcst_${city}_${dateTime}`,
      );
      let fcstValue: number;

      if (cacheData) {
        fcstValue = cacheData;
      } else {
        const { x, y } = dfsXyConvert('TO_GRID', x_code, y_code);

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
        if (response.data.response.header.resultCode !== '00') {
          throw {
            errno: HttpStatus.SERVICE_UNAVAILABLE,
            message: response.data.response.header.resultMsg,
          };
        }
        fcstValue = getTargetTemperature(
          response.data.response.body?.items?.item,
          targetDate,
          targetTime,
          'T1H',
        );
        const cacheKey = `UltraSrtFcst_${city}_${dateTime}`;
        const milliSeconds = calculateMS(2880);
        await this.cacheManager.set(cacheKey, fcstValue, milliSeconds);
      }
      const closet = await this.closetRepository.getClosetByTemperature(
        fcstValue,
        user,
      );

      return {
        ...closet,
        fcstValue,
      };
    } catch (err) {
      switch (err.errno) {
        case HttpStatus.SERVICE_UNAVAILABLE:
          throw new HttpException(
            {
              message: HTTP_ERROR.SERVICE_UNAVAILABLE,
              detail: err.message,
            },
            HttpStatus.SERVICE_UNAVAILABLE,
          );
        case MYSQL_ERROR_CODE.SQL_SYNTAX:
          throw new HttpException(
            {
              message: HTTP_ERROR.SQL_SYNTAX_ERROR,
              detail: 'SERVER ERROR!',
            },
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
      }
    }
  }

  @Transactional()
  async setRecommendCloset(
    setRecommendClosetDto: SetRecommendClosetDto,
    user: User,
    address: Address,
  ) {
    try {
      await this.userPickWeatherRepository.setRecommendCloset(
        setRecommendClosetDto,
        user,
        address,
      );
    } catch (err) {
      switch (err.errno) {
        case MYSQL_ERROR_CODE.DUPLICATED_KEY:
          throw new HttpException(
            {
              message: HTTP_ERROR.DUPLICATED_KEY_ERROR,
              detail: '이미 선택한 체감온도 입니다.',
            },
            HttpStatus.BAD_REQUEST,
          );
      }
    }
  }

  // MAIN
  async getRecommendCloset(
    getRecommendClosetDto: GetRecommendClosetDto,
    user: User,
    address: Address,
  ) {
    try {
      // use 단기예보 API
      const { dateTime } = getRecommendClosetDto;
      const targetDateTime = new Date(dateTime);
      const targetDate = getTargetDate(targetDateTime);
      const targetTime = getTargetTime(targetDateTime);
      const { city, x_code, y_code } = address;
      // const { base_date, base_time } = getVilageFcstBaseTime();
      const base_date = getYesterdayBaseDate();

      const cacheData: any | null = await this.cacheManager.get(
        `VilageFcst_${city}_${base_date}`,
      );
      let weather: any;
      let fcstValue: number;

      if (cacheData) {
        console.log('캐시로가냐?');
        weather = cacheData;
        fcstValue = getTargetTemperature(
          weather,
          targetDate,
          targetTime,
          'TMP',
        );
      } else {
        const { x, y } = dfsXyConvert('TO_GRID', x_code, y_code);

        const response = await this.axiosInstance.get(
          `/VilageFcstInfoService_2.0/getVilageFcst`,
          {
            params: {
              base_date: base_date,
              base_time: '2300',
              nx: x,
              ny: y,
            },
          },
        );
        if (response.data.response.header.resultCode !== '00') {
          throw {
            errno: HttpStatus.SERVICE_UNAVAILABLE,
            message: response.data.response.header.resultMsg,
          };
        }
        weather = response.data.response.body?.items?.item;
        fcstValue = getTargetTemperature(
          weather,
          targetDate,
          targetTime,
          'TMP',
        );
        const milliSeconds = calculateMS(2880);
        await this.cacheManager.set(
          `VilageFcst_${city}_${base_date}`,
          response.data.response.body?.items?.item,
          milliSeconds,
        );
      }
      const closet = await this.closetRepository.getClosetByTemperature(
        fcstValue,
        user,
      );

      return {
        closet: {
          ...closet,
        },
        weather: {
          ...weather,
        },
      };
    } catch (err) {
      switch (err.errno) {
        case HttpStatus.SERVICE_UNAVAILABLE:
          throw new HttpException(
            {
              message: HTTP_ERROR.SERVICE_UNAVAILABLE,
              detail: err.message,
            },
            HttpStatus.SERVICE_UNAVAILABLE,
          );
        case MYSQL_ERROR_CODE.SQL_SYNTAX:
          throw new HttpException(
            {
              message: HTTP_ERROR.SQL_SYNTAX_ERROR,
              detail: 'SERVER ERROR!',
            },
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
      }
    }
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

function getTargetDate(targetDateTime: Date): string {
  return `${targetDateTime.getFullYear()}${padNumber(
    targetDateTime.getMonth() + 1,
  )}${padNumber(targetDateTime.getDate())}`;
}

function getTargetTime(targetDateTime: Date): string {
  return formatTime(targetDateTime.getHours());
}

function getTargetTemperature(
  items: any[],
  targetDate: string,
  targetTime: string,
  separator: string,
) {
  const apiData =
    items?.filter((item) => {
      return (
        item.fcstDate === targetDate &&
        item.fcstTime === targetTime &&
        item.category === separator
      );
    }) || [];
  console.log(apiData[0].fcstValue);

  return apiData[0].fcstValue;
}

function filterClosetsByType(closets: any[], type: string) {
  return closets.filter((closet) => closet.typeName === type);
}

function getRandomIndex(max: number) {
  return Math.floor(Math.random() * max);
}
