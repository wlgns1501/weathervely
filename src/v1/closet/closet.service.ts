import { Injectable } from '@nestjs/common';
import { AxiosInstance } from 'axios';
import { createPublicApiAxiosInstance } from '../../lib/config/axios.config';
import {
  dfsXyConvert,
  getWeatherState,
  getBaseDateTime,
  getRoundedHour,
} from '../../lib/utils/publicForecast';
import { User } from 'src/entities/user.entity';
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

  async getRecommendCloset(temperature: number, user: User) {
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

    const closets = await this.closetRepository.getRecommendCloset(temperature);
    // console.log('sorted', sorted); // ['casual','formal','unisex']
    // console.log('closets', closets);
    for (let i = 0; i < sorted?.length; i++) {
      const arr_closets = closets.filter((it) => it.typeName === sorted[i]);
      if (arr_closets.length > 0) {
        const random_num = Math.floor(Math.random() * arr_closets.length);
        console.log('@@@옷@@@', arr_closets[random_num]);
        return arr_closets[random_num];
      }
    }

    // 예외 1. 온도를 포함하는 옷이 없을때 - 정책 수립 필요

    // return result;
  }
}
