import { HttpException, HttpStatus, Injectable, Inject } from '@nestjs/common';
import { User } from 'src/entities/user.entity';
import { UserSetTemperature } from 'src/entities/user_set_temperature.entity';
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
import { UserSetTemperatureRepository } from 'src/repositories/user_set_temperature.repository';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { getCalculateSensoryTemperature } from 'src/lib/utils/calculate';
import { SetTemperatureDto } from './dtos/setTemperature.dto';
import { GetRecommendClosetDto } from './dtos/getRecommendCloset.dto';
import { GetClosetByTemperatureDto } from './dtos/getClosetByTemperature.dto';
import { ForecastService } from '../forecast/forecast.service';
import { TypeRepository } from 'src/repositories/type.repository';

@Injectable()
export class ClosetService {
  constructor(
    private readonly closetRepository: ClosetRepository,
    private readonly userSetStyleRepository: UserSetStyleRepository,
    private readonly userPickStyleRepository: UserPickStyleRepository,
    private readonly userSetTemperatureRepository: UserSetTemperatureRepository,
    private readonly temperatureRangeRepository: TemperatureRangeRepository,
    private readonly typeRepository: TypeRepository,
    private readonly forecastService: ForecastService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getClosetList() {
    try {
      const closets = await this.closetRepository.getClosetList();

      return closets;
    } catch (err) {
      console.log(err);
    }
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
      // use 단기예보 API
      const { dateTime, closet_id } = getClosetByTemperatureDto;
      const date = new Date(dateTime);
      const targetDateTime = new Date(dateTime);
      const targetDate = getTargetDate(targetDateTime);
      const targetTime = getTargetTime(targetDateTime);
      const weather = await this.forecastService.getVilageFcst(address);
      const tmpValue = getTargetValue(weather, targetDate, targetTime, 'TMP');

      if (closet_id) {
        // 메인
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(23, 0, 0, 0);
        if (date < today || date > tomorrow) {
          // dateTime이 어제 이거나, 내일 23시 이후일때
          throw {
            status_code: HttpStatus.BAD_REQUEST,
            message: HTTP_ERROR.BAD_REQUEST,
            detail: '유효하지 않은 시간대입니다.',
          };
        }
        const closet = await this.closetRepository.getClosetById(closet_id);
        if (!closet) {
          throw {
            status_code: HttpStatus.NOT_FOUND,
            message: HTTP_ERROR.NOT_FOUND,
            detail: '해당 옷이 존재하지 않습니다.',
          };
        }

        const type_id = await this.typeRepository.getTypeId(closet.id);

        const temperatureRange =
          await this.temperatureRangeRepository.getTemperatureId(closet.id);
        const temp_id = temperatureRange.id;
        const temperature =
          (Number(temperatureRange.min_temp) +
            Number(temperatureRange.max_temp)) /
          2;
        const closets = await this.closetRepository.getClosetByTemperature(
          temperature,
          type_id,
          user,
        );

        if (temp_id) {
          closets.forEach((c) => {
            if (c.temp_id === temp_id) {
              c.closet_id = closet.id;
              c.name = closet.name;
              c.image_url = closet.image_url;
            }
          });
        }

        return {
          closets,
          tmpValue,
        };
      } else {
        // 온보딩
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(3, 0, 0, 0);
        if (date < yesterday || date > new Date()) {
          // dateTime이 어제 03시 이전이거나, 현재시간 이후일때
          throw {
            status_code: HttpStatus.BAD_REQUEST,
            message: HTTP_ERROR.BAD_REQUEST,
            detail: '유효하지 않은 시간대입니다.',
          };
        }

        // const fromTypeQuery = await this.typeRepository.fromTypeQuery();
        const randomTypeId = await this.typeRepository.typeQuery();

        const closets = await this.closetRepository.getClosetByTemperature(
          Number(tmpValue),
          randomTypeId,
          user,
        );

        return {
          closets,
          tmpValue,
        };
      }
    } catch (err) {
      console.log(err);

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

  @Transactional()
  async setTemperature(
    setTemperatureDto: SetTemperatureDto,
    user: User,
    address: Address,
  ) {
    try {
      const { closet, current_temperature } = setTemperatureDto;
      if (!closet || isNaN(Number(current_temperature))) {
        throw {
          status_code: HttpStatus.BAD_REQUEST,
          message: HTTP_ERROR.BAD_REQUEST,
          detail: '유효하지 않은 요청입니다.',
        };
      }
      const averageTemp = await this.temperatureRangeRepository.getAverageTemp(
        closet,
      );

      const newUserSetTemperature = new UserSetTemperature();
      newUserSetTemperature.closet = closet;
      newUserSetTemperature.current_temperature = current_temperature;
      newUserSetTemperature.created_at = new Date();

      if (averageTemp.id === 1) {
        // 제일 높은 구간
        newUserSetTemperature.sensory_temperature =
          Number(current_temperature) < 28 // 현재온도가 28도 보다 낮을때
            ? '28' // 28도 이상은 하나의 구간이니깐 28도로 set
            : current_temperature; // 체감온도 스와이프 x이니깐, 선택 체감 = 현재 온도
      } else if (averageTemp.id === 9) {
        // 제일 낮은 구간
        newUserSetTemperature.sensory_temperature =
          Number(current_temperature) > 5 // 현재온도가 5도 보다 높을때
            ? '5' // 5도 이하는 하나의 구간이니깐 5도로 set
            : current_temperature; // 체감온도 스와이프 x이니깐, 선택 체감 = 현재 온도
      } else {
        newUserSetTemperature.sensory_temperature = averageTemp.avg_temp;
      }

      await this.userSetTemperatureRepository.setTemperature(
        newUserSetTemperature,
        user,
        address,
      );
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

  // MAIN
  async getRecommendCloset(
    getRecommendClosetDto: GetRecommendClosetDto,
    user: User,
    address: Address,
  ) {
    try {
      // use 단기예보 API
      const { dateTime } = getRecommendClosetDto;

      const date = new Date(dateTime);

      const today = new Date();

      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(23, 0, 0, 0);

      if (date < today || date > tomorrow) {
        // dateTime이 어제 이거나, 내일 23시 이후일때
        throw {
          status_code: HttpStatus.BAD_REQUEST,
          message: HTTP_ERROR.BAD_REQUEST,
          detail: '유효하지 않은 시간대입니다.',
        };
      }

      const targetDateTime = new Date(dateTime);
      const targetDate = getTargetDate(targetDateTime);
      const targetTime = getTargetTime(targetDateTime);
      const weather = await this.forecastService.getVilageFcst(address);
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

      // 공식 적용 체감 온도
      const sonsoryTemperature = getCalculateSensoryTemperature(
        Number(temperatureValue),
        Number(windValue),
        Number(humidityValue),
      );

      // user 선택 체감온도 가져오기 - Array
      const sensoryTemperatureArr =
        await this.userSetTemperatureRepository.getSensoryTemperature(user);

      // 각 row 별 체감온도 차이 계산 후 합산
      const avgSensoryTemperature = sensoryTemperatureArr.reduce((acc, cur) => {
        return (
          (acc += Number(cur.UserSetTemperature_sensory_temperature)) -
          Number(cur.UserSetTemperature_current_temperature)
        );
      }, 0);

      // user 체감 온도 : 공식 적용 체감 온도 + (유저선택 체감온도 차이 누적값 / 선택 횟수)
      const userSensoryTemperature =
        avgSensoryTemperature === 0
          ? sonsoryTemperature
          : sonsoryTemperature +
            avgSensoryTemperature / sensoryTemperatureArr.length;

      // Math.round 빼고, between 를 초과 + 이하 or 이상 + 미만으로 변경하고 , temperature_range 범위 교집합으로 수정해야함
      const closets = await this.closetRepository.getRecommendCloset(
        userSensoryTemperature,
      );

      // 조회 기온과 온도차이
      const temperatureDifference = userSensoryTemperature - temperatureValue;

      return {
        temperatureDifference: Math.round(temperatureDifference),
        closets,
      };
    } catch (err) {
      console.log(err);

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

  @Transactional()
  async saveClosetClickHistory(user: User, closetId: number) {
    const userId = user.id;

    await this.userPickStyleRepository.saveClosetClickHistory(userId, closetId);

    return { success: true };
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
