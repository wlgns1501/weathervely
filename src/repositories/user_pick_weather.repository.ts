import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { UserPickWeather } from 'src/entities/user_pick_weather.entity';
import { Address } from 'src/entities/address.entity';
import { User } from 'src/entities/user.entity';
import { SetTemperatureDto } from 'src/v1/closet/dtos/setTemperature.dto';

@Injectable()
export class UserPickWeatherRepository extends Repository<UserPickWeather> {
  constructor(private dataSource: DataSource) {
    super(UserPickWeather, dataSource.createEntityManager());
  }

  async setTemperature(
    userPickWeather: UserPickWeather,
    user: User,
    address: Address,
  ) {
    return await this.create({
      ...userPickWeather,
      user,
      address,
    }).save();
  }
}
