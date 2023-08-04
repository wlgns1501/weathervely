import { HttpException, HttpStatus, Injectable, Inject } from '@nestjs/common';
import { AxiosInstance } from 'axios';
import { createPublicApiAxiosInstance } from '../../lib/config/axios.config';
import { dfsXyConvert, getBaseDateTime } from '../../lib/utils/publicForecast';
import { User } from 'src/entities/user.entity';
import { Address } from 'src/entities/address.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { MYSQL_ERROR_CODE } from 'src/lib/constant/mysqlError';
import { HTTP_ERROR } from 'src/lib/constant/httpError';
import { calculateMS } from 'src/lib/utils/calculate';
import { GetClosetByTemperatureDto } from '../closet/dtos/getClosetByTemperature.dto';
@Injectable()
export class ForecastService {
  private readonly axiosInstance: AxiosInstance;

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
    this.axiosInstance = createPublicApiAxiosInstance();
  }

  async getUltraSrtForecastInfo(
    getClosetByTemperatureDto: GetClosetByTemperatureDto,
    address: Address,
  ) {
    try {
      const weather = await this.getUltraSrtFcst(
        getClosetByTemperatureDto,
        address,
      );
      return weather;
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
        default:
          throw new HttpException(
            {
              message: HTTP_ERROR.INTERNAL_SERVER_ERROR,
              detail: err.message,
            },
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
      }
    }
  }

  async getVilageForecastInfo(address: Address) {
    try {
      const weather = await this.getVilageFcst(address);
      return weather;
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
        default:
          throw new HttpException(
            {
              message: HTTP_ERROR.INTERNAL_SERVER_ERROR,
              detail: err.message,
            },
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
      }
    }
  }

  async getTendayForecastInfo(address: Address) {
    try {
      const temperatureInfo = await this.getMidTa(address);
      const weatherInfo = await this.getMidLandFcst(address);
      return {
        temperature: temperatureInfo,
        weather: weatherInfo,
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
        default:
          throw new HttpException(
            {
              message: HTTP_ERROR.INTERNAL_SERVER_ERROR,
              detail: err.message,
            },
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
      }
    }
  }

  // 조회시간 기준 상세날씨
  async getUltraSrtFcst(
    getClosetByTemperatureDto: GetClosetByTemperatureDto,
    address: Address,
  ) {
    try {
      const { dateTime } = getClosetByTemperatureDto;
      const targetDateTime = new Date(dateTime);
      const { city, x_code, y_code } = address;
      const cacheKey = `UltraSrtFcst_${city}_${dateTime}`;
      const cacheData: any | null = await this.cacheManager.get(
        `UltraSrtFcst_${city}_${dateTime}`,
      );
      let weather: any;
      if (cacheData) {
        weather = cacheData;
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
        weather = response.data.response.body?.items?.item;
        const milliSeconds = calculateMS(2880);
        await this.cacheManager.set(cacheKey, weather, milliSeconds);
      }
      return weather;
    } catch (err) {
      throw err;
    }
  }

  // 어제 ~ 2일후 날씨
  async getVilageFcst(address: Address) {
    try {
      const { city, x_code, y_code } = address;
      const base_date = getBaseDateTime({ provide: 2880 }).base_date;
      console.log(base_date);

      const cacheKey = `VilageFcst_${city}_${base_date}`;
      const cacheData: any | null = await this.cacheManager.get(cacheKey);
      let weather: any;
      if (cacheData) {
        weather = cacheData;
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
        const milliSeconds = calculateMS();
        await this.cacheManager.set(cacheKey, weather, milliSeconds);
      }
      return weather;
    } catch (err) {
      console.log(err);

      throw err;
    }
  }

  // 3일후 ~ 10일후 기온 예보
  private async getMidTa(address: Address) {
    try {
      const { city } = address;
      const date = new Date();
      const base_date =
        date.getHours() < 18
          ? getBaseDateTime({ provide: 1440 }).base_date
          : getBaseDateTime({ provide: 0 }).base_date;
      const cacheKey = `MidTa_${city}_${base_date}`;
      const cacheData: any | null = await this.cacheManager.get(cacheKey);
      let temperatureInfo: any;
      if (cacheData) {
        temperatureInfo = cacheData;
      } else {
        const response = await this.axiosInstance.get(
          `/MidFcstInfoService/getMidTa`,
          {
            params: {
              regId: '11B10101', // 지점번호 - ( TODO: 매핑 필요 )
              tmFc: `${base_date}1800`, // 어제 18시 발표 데이터
            },
          },
        );
        if (response?.data?.response?.header?.resultCode !== '00') {
          throw {
            errno: HttpStatus.SERVICE_UNAVAILABLE,
            message: response.data.response.header.resultMsg,
          };
        }
        temperatureInfo = response.data.response.body?.items?.item;
        const milliSeconds = calculateMS();
        await this.cacheManager.set(cacheKey, temperatureInfo, milliSeconds);
      }
      return temperatureInfo;
    } catch (err) {
      console.log(err);

      throw err;
    }
  }

  // 3일후 ~ 10일후 날씨 예보
  private async getMidLandFcst(address: Address) {
    try {
      const { city } = address;
      const date = new Date();
      const base_date =
        date.getHours() < 18
          ? getBaseDateTime({ provide: 1440 }).base_date
          : getBaseDateTime({ provide: 0 }).base_date;
      const cacheKey = `MidLandFcst_${city}_${base_date}`;
      const cacheData: any | null = await this.cacheManager.get(cacheKey);
      let weatherInfo: any;
      if (cacheData) {
        weatherInfo = cacheData;
      } else {
        const response = await this.axiosInstance.get(
          `/MidFcstInfoService/getMidLandFcst`,
          {
            params: {
              regId: '11B00000', // 지점번호 - ( TODO: 매핑 필요 )
              tmFc: `${base_date}1800`, // 어제 18시 발표 데이터
            },
          },
        );
        if (response?.data?.response?.header?.resultCode !== '00') {
          throw {
            errno: HttpStatus.SERVICE_UNAVAILABLE,
            message: response.data.response.header.resultMsg,
          };
        }
        weatherInfo = response.data.response.body?.items?.item;
        const milliSeconds = calculateMS();
        await this.cacheManager.set(cacheKey, weatherInfo, milliSeconds);
      }
      return weatherInfo;
    } catch (err) {
      throw err;
    }
  }
  // // 온보딩 : 위치 기준 어제 , 그저께 최저온도 , 최고온도 ( getWthrDataList() )
  // async getWthrDataList() {
  //   // address_id 받아야됨

  //   const beforeYesterday = getBaseDateTime({ provide: 2880 }).base_date;
  //   const yesterday = getBaseDateTime({ provide: 1440 }).base_date;

  //   const response = await this.axiosInstance.get(
  //     `/AsosDalyInfoService/getWthrDataList`,
  //     {
  //       params: {
  //         dataCd: 'ASOS', // 자료 코드
  //         dateCd: 'DAY', // 날짜 코드
  //         startDt: beforeYesterday, // 시작일
  //         endDt: yesterday, // 종료일
  //         stnIds: 108, // 지점 번호 - 서울 ( TODO: 매핑 필요 )
  //       },
  //     },
  //   );

  //   const data =
  //     response.data.response.body?.items?.item.map((it) => {
  //       return {
  //         date: it.tm,
  //         minTmp: it.minTa,
  //         maxTmp: it.maxTa,
  //       };
  //     }) ?? [];
  //   return data;
  // }

  // // 메인 : 현재온도 , 바람 , 날씨 -> 단기예보 -> 초단기예보 ( getUltraSrtFcst() )
  // async getUltraSrtFcst<T>(x: number, y: number): Promise<T> {
  //   const xyObj = dfsXyConvert('TO_GRID', x, y);
  //   const response = await this.axiosInstance.get(
  //     `/VilageFcstInfoService_2.0/getUltraSrtFcst`,
  //     {
  //       params: {
  //         ...getBaseDateTime({ minutes: 30, provide: 45 }), // bastTime 기준시간 매시 30분 , api 데이터 업데이트 시간 매시 45분
  //         nx: xyObj.x,
  //         ny: xyObj.y,
  //       },
  //     },
  //   );

  //   const nowHours = getRoundedHour();
  //   console.log(nowHours);
  //   const data =
  //     response.data.response.body?.items?.item
  //       .filter(
  //         (it) =>
  //           it.fcstTime === nowHours &&
  //           (it.category === 'SKY' ||
  //             it.category === 'T1H' ||
  //             it.category === 'RN1' ||
  //             it.category === 'REH' ||
  //             it.category === 'PTY' ||
  //             it.category === 'WSD'),
  //       )
  //       .map((it) => {
  //         return {
  //           category: it.category,
  //           value: it.fcstValue,
  //           dateTime: it.fcstTime,
  //         };
  //       }) ?? [];

  //   return data;
  // }

  // // 메인 : 오늘 최저온도 , 최고온도 response => 단기예보 -> 단기예보 ( getVilageFcst() )
  // async getVilageFcst() {
  //   const yesterday = getBaseDateTime({ provide: 1440 });
  //   const today = getBaseDateTime({ provide: 0 });
  //   const tomorrow = getBaseDateTime({ provide: -1440 });

  //   const response = await this.axiosInstance.get(
  //     `/VilageFcstInfoService_2.0/getVilageFcst`,
  //     {
  //       params: {
  //         base_date: yesterday.base_date,
  //         base_time: '2300',
  //         nx: 55, // 계산
  //         ny: 127, // 계산
  //       },
  //     },
  //   );

  //   const data = response.data.response.body?.items?.item.filter(
  //     (it) =>
  //       it.fcstDate === today.base_date || it.fcstDate === tomorrow.base_date,
  //     // (it.category === 'TMN' || // 최고기온
  //     // it.category === 'TMX'), // 최저기온
  //     // it.category === 'SKY' || // 하늘상태
  //     // it.category === 'TMP', // 1시간 체감온도
  //     // it.category === 'PCP' || // 1시간 강수량
  //     // it.category === 'REH' || // 습도
  //     // it.category === 'PTY' || // 강수형태
  //     // it.category === 'WSD', // 풍속
  //   );
  //   // .map((it) => {
  //   //   return {
  //   //     category: it.category,
  //   //     date: it.fcstDate,
  //   //     time: it.fcstTime,
  //   //     tmp: it.fcstValue,
  //   //   };
  //   // }) ?? [];

  //   console.log(data);

  //   return data;
  // }

  // // 메인 -> 주간 예보 : 글피부터 최대 10일간의 최저온도 최고온도 제공 => 중기예보 -> 중기기온조회( getOpenForecastMidInfo() )
  // async getMidTa() {
  //   const yesterday = getBaseDateTime({ provide: 1440 });
  //   const response = await this.axiosInstance.get(
  //     `/MidFcstInfoService/getMidTa`,
  //     {
  //       params: {
  //         regId: '11B10101', // 지점번호 - ( TODO: 매핑 필요 )
  //         tmFc: `${yesterday.base_date}1800`, // 어제 18시 발표 데이터
  //       },
  //     },
  //   );

  //   const data = response.data.response.body?.items?.item ?? [];
  //   // const data =
  //   //   response.data.response.body?.items?.item?.map((it) => {
  //   //     const { regId, ...rest } = it;
  //   //     const result = {};
  //   //     Object.keys(rest).forEach((key) => {
  //   //       if (!key.includes('High') && !key.includes('Low')) {
  //   //         result[key] = rest[key];
  //   //       }
  //   //     });
  //   //     return result;
  //   //   }) ?? [];

  //   return data;
  // }
}
