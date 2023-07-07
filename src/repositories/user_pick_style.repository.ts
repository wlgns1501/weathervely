import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { UserPickStyle } from 'src/entities/user_pick_style.entity';
import { Address } from 'src/entities/address.entity';
import { User } from 'src/entities/user.entity';

@Injectable()
export class UserPickStyleRepository extends Repository<UserPickStyle> {
  constructor(private dataSource: DataSource) {
    super(UserPickStyle, dataSource.createEntityManager());
  }

  async getOrderStyle(user: User) {
    const userId = user.id;
    const queryBuilder = await this.createQueryBuilder('user_pick_style').where(
      'user_id = :userId',
      { userId },
    );
    return queryBuilder.getOne();
  }
}
