import { Injectable } from '@nestjs/common';
import { Closet } from 'src/entities/closet.entity';
import { User } from 'src/entities/user.entity';
import { UserSetStyle } from 'src/entities/user_set_style.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class UserSetStyleRepository extends Repository<UserSetStyle> {
  constructor(private dataSource: DataSource) {
    super(UserSetStyle, dataSource.createEntityManager());
  }

  async setUserStyle(closet: Closet, user: User) {
    return await this.create({ closet, user }).save();
  }
}
