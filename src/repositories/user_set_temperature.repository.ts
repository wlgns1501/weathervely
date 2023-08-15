import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { UserSetTemperature } from 'src/entities/user_set_temperature.entity';
import { Address } from 'src/entities/address.entity';
import { User } from 'src/entities/user.entity';
import { SetTemperatureDto } from 'src/v1/closet/dtos/setTemperature.dto';

@Injectable()
export class UserSetTemperatureRepository extends Repository<UserSetTemperature> {
  constructor(private dataSource: DataSource) {
    super(UserSetTemperature, dataSource.createEntityManager());
  }

  async setTemperature(
    userSetTemperature: UserSetTemperature,
    user: User,
    address: Address,
  ) {
    return await this.create({
      ...userSetTemperature,
      user,
      address,
    }).save();
  }

  async getSensoryTemperature(user: User) {
    const queryBuilder = await this.createQueryBuilder()
      .where('user_id = :userId')
      .setParameter('userId', user.id);
    return queryBuilder.getRawMany();
  }
}
