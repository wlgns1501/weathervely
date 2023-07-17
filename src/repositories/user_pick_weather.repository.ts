import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { UserPickWeather } from 'src/entities/user_pick_weather.entity';
import { Address } from 'src/entities/address.entity';
import { User } from 'src/entities/user.entity';
import { SetRecommendClosetDto } from 'src/v1/closet/dtos/setRecommendCloset.dto';

@Injectable()
export class UserPickWeatherRepository extends Repository<UserPickWeather> {
  constructor(private dataSource: DataSource) {
    super(UserPickWeather, dataSource.createEntityManager());
  }

  async setRecommendCloset(
    setRecommendClosetDto: SetRecommendClosetDto,
    user: User,
    address: Address,
  ) {
    return await this.create({
      ...setRecommendClosetDto,
      user,
      address,
    }).save();
  }

  // user_set_style도 만들어야댐
  async getOrderStyle(user: User) {
    const userId = user.id;
    const queryBuilder = await this.createQueryBuilder('user_pick_').where(
      'user_id = :userId',
      { userId },
    );
    return queryBuilder.getOne();
  }
}
