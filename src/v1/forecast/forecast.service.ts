import { HttpException, HttpStatus, Injectable, Inject } from '@nestjs/common';
import { AxiosInstance } from 'axios';
import { createPublicApiAxiosInstance } from '../../lib/config/axios.config';
import {
  dfsXyConvert,
  getBaseDateTime,
  midTaCode,
  midLandFcstCode,
} from '../../lib/utils/publicForecast';
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

  async getVilageForecastInfo(address: Address) {
    try {
      const weather = await this.getVilageFcst(address);
      return weather;
    } catch (err) {
      if (!err.status_code) {
        throw new HttpException(
          {
            message: HTTP_ERROR.INTERNAL_SERVER_ERROR,
            detail: '서버가 불안정 합니다.',
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      throw new HttpException(
        { message: err.message, detail: err.detail },
        err.status_code,
      );
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
      if (!err.status_code) {
        throw new HttpException(
          {
            message: HTTP_ERROR.INTERNAL_SERVER_ERROR,
            detail: '서버가 불안정 합니다.',
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      throw new HttpException(
        { message: err.message, detail: err.detail },
        err.status_code,
      );
    }
  }

  // 어제 ~ 2일후 날씨
  async getVilageFcst(address: Address) {
    try {
      const { city, x_code, y_code } = address;
      const base_date = getBaseDateTime({ provide: 1440 }).base_date;

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
              base_time: '0200',
              nx: x,
              ny: y,
            },
          },
        );

        if (response.data.response.header.resultCode !== '00') {
          throw {
            status_code: HttpStatus.SERVICE_UNAVAILABLE,
            message: response.data.response.header.resultMsg,
            detail: '날씨를 불러오는데 실패하였습니다.',
          };
        }
        weather = response.data.response.body?.items?.item;
        const milliSeconds = calculateMS();
        await this.cacheManager.set(cacheKey, weather, milliSeconds);
      }
      return weather;
    } catch (err) {
      throw err;
    }
  }

  // 3일후 ~ 10일후 기온 예보 - 중기기온예보
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
              regId: midTaCode(city), // 지점번호 - ( TODO: 매핑 필요 )
              tmFc: `${base_date}1800`, // 어제 18시 발표 데이터
            },
          },
        );

        if (response?.data?.response?.header?.resultCode !== '00') {
          throw {
            status_code: HttpStatus.SERVICE_UNAVAILABLE,
            message: response.data.response.header.resultMsg,
            detail: '기온을 불러오는데 실패하였습니다.',
          };
        }
        temperatureInfo = response.data.response.body?.items?.item;

        const milliSeconds = calculateMS();
        await this.cacheManager.set(cacheKey, temperatureInfo, milliSeconds);
      }
      return temperatureInfo;
    } catch (err) {
      throw err;
    }
  }

  // 3일후 ~ 10일후 날씨 예보 - 중기육상예보
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
              regId: midLandFcstCode(city), // 지점번호 - ( TODO: 매핑 필요 )
              tmFc: `${base_date}1800`, // 어제 18시 발표 데이터
            },
          },
        );
        if (response?.data?.response?.header?.resultCode !== '00') {
          throw {
            status_code: HttpStatus.SERVICE_UNAVAILABLE,
            message: response.data.response.header.resultMsg,
            detail: '날씨를 불러오는데 실패하였습니다.',
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
}
