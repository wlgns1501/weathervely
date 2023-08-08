import { HttpException, HttpStatus, Injectable, Inject } from '@nestjs/common';
import { User } from 'src/entities/user.entity';
import { UserPickWeather } from 'src/entities/user_pick_weather.entity';
import { ClosetRepository } from 'src/repositories/closet.repository';
import { Transactional } from 'typeorm-transactional';
import { PickClosetDto } from './dtos/pickCloset.dto';
import { UserSetStyleRepository } from 'src/repositories/user_set_style.repository';
import { TemperatureRangeRepository } from 'src/repositories/temperature_range.repository';
import { MYSQL_ERROR_CODE } from 'src/lib/constant/mysqlError';
import { HTTP_ERROR } from 'src/lib/constant/httpError';
import { formatTime, padNumber } from '../../lib/utils/publicForecast';
import { Address } from 'src/entities/address.entity';
import { UserPickStyleRepository } from 'src/repositories/user_pick_style.repository';
import { UserPickWeatherRepository } from 'src/repositories/user_pick_weather.repository';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { getCalculateSensoryTemperature } from 'src/lib/utils/calculate';
import { SetTemperatureDto } from './dtos/setTemperature.dto';
import { GetRecommendClosetDto } from './dtos/getRecommendCloset.dto';
import { GetClosetByTemperatureDto } from './dtos/getClosetByTemperature.dto';
import { ForecastService } from '../forecast/forecast.service';

@Injectable()
export class ClosetService {
  constructor(
    private readonly closetRepository: ClosetRepository,
    private readonly userSetStyleRepository: UserSetStyleRepository,
    private readonly userPickStyleRepository: UserPickStyleRepository,
    private readonly userPickWeatherRepository: UserPickWeatherRepository,
    private readonly temperatureRangeRepository: TemperatureRangeRepository,
    private readonly forecastService: ForecastService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

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
    getClosetByTemperatureDto: GetClosetByTemperatureDto,
    user: User,
    address: Address,
  ) {
    try {
      // use 초단기예보 API
      const { dateTime } = getClosetByTemperatureDto;
      const targetDateTime = new Date(dateTime);
      const targetDate = getTargetDate(targetDateTime);
      const targetTime = getTargetTime(targetDateTime);
      const weather = await this.forecastService.getUltraSrtFcst(
        getClosetByTemperatureDto,
        address,
      );
      const fcstValue = getTargetValue(weather, targetDate, targetTime, 'T1H');
      const closet = await this.closetRepository.getClosetByTemperature(
        fcstValue,
        user,
      );
      return {
        closet,
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
        default:
          throw new HttpException(
            {
              message: HTTP_ERROR.INTERNAL_SERVER_ERROR,
              detail: HTTP_ERROR.INTERNAL_SERVER_ERROR,
            },
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
      }
    }
  }

  @Transactional()
  async setTemperature(
    setTemperatureDto: SetTemperatureDto,
    user: User,
    address: Address,
  ) {
    try {
      const { closet } = setTemperatureDto;
      const temperatureRange =
        await this.temperatureRangeRepository.getTemperatureId(closet);
      const newUserPickWeather = new UserPickWeather();
      newUserPickWeather.closet = closet;
      newUserPickWeather.temperature = setTemperatureDto.temperature;
      newUserPickWeather.temperatureRange = temperatureRange;
      newUserPickWeather.created_at = new Date();
      await this.userPickWeatherRepository.setTemperature(
        newUserPickWeather,
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
        default:
          throw new HttpException(
            {
              message: HTTP_ERROR.INTERNAL_SERVER_ERROR,
              detail: HTTP_ERROR.INTERNAL_SERVER_ERROR,
            },
            HttpStatus.INTERNAL_SERVER_ERROR,
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

      const weather = await this.forecastService.getVilageFcst(address);
      console.log(weather);
      const temperatureValue = getTargetValue(
        weather,
        targetDate,
        targetTime,
        'TMP',
      );
      const windValue = getTargetValue(weather, targetDate, targetTime, 'WSD');
      const humidityValue = getTargetValue(
        weather,
        targetDate,
        targetTime,
        'REH',
      );

      const sonsoryTemperature = getCalculateSensoryTemperature(
        temperatureValue,
        windValue,
        humidityValue,
      );
      console.log('windValue', windValue);
      console.log('humidityValue', humidityValue);
      console.log('temperatureValue', temperatureValue);
      console.log('sonsoryTemperature', sonsoryTemperature);
      const closet = await this.closetRepository.getRecommendCloset(
        temperatureValue,
      );
      return closet;
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
        default:
          throw new HttpException(
            {
              message: HTTP_ERROR.INTERNAL_SERVER_ERROR,
              detail: HTTP_ERROR.INTERNAL_SERVER_ERROR,
            },
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
      }
    }
  }
}

function getTargetDate(targetDateTime: Date): string {
  return `${targetDateTime.getFullYear()}${padNumber(
    targetDateTime.getMonth() + 1,
  )}${padNumber(targetDateTime.getDate())}`;
}

function getTargetTime(targetDateTime: Date): string {
  return formatTime(targetDateTime.getHours());
}

function getTargetValue(
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

  return apiData[0].fcstValue;
}

function filterClosetsByType(closets: any[], type: string) {
  return closets.filter((closet) => closet.typeName === type);
}

function getRandomIndex(max: number) {
  return Math.floor(Math.random() * max);
}
