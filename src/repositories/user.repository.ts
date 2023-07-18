import { Injectable } from '@nestjs/common';
import { User } from 'src/entities/user.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async getUserNickNameGender(userId: number) {
    return await this.find({
      where: {
        id: userId,
      },
      select: ['id', 'nickname', 'gender'],
    });
  }

  async updateNickNameGender(nickname: string, gender: string, userId: number) {
    return await this.update({ id: userId }, { gender, nickname });
  }
}
