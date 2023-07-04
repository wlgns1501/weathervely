import { Injectable } from '@nestjs/common';
import { User } from 'src/entities/user.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class AuthRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async getUserByNickname(nickName: string) {
    return await this.findOne({
      where: {
        nickname: nickName,
      },
    });
  }

  async createNickName(nickname: string, accessToken: string) {
    return await this.create({ nickname, token: accessToken }).save();
  }
}
