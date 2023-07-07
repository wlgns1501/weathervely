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

    let result: any | null = null;
    while (!result) {
      result = await this.closetRepository.getRecommendCloset('', temperature);
    }
    return result;
  }
}
