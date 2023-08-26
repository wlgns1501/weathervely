import { Injectable } from '@nestjs/common';
import { SetGenderDto } from 'src/v1/auth/dtos/setGender.dto';
import { User } from 'src/entities/user.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class AuthRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async getUserByPhoneId(phone_id: string) {
    return await this.findOne({
      where: {
        phone_id,
      },
    });
  }

  async getUserByNickname(nickname: string) {
    return await this.findOne({
      where: {
        nickname,
      },
    });
  }

  async getUsers() {
    return await this.find();
  }

  async createNickName(
    nickname: string,
    phone_id: string,
    accessToken: string,
  ) {
    return await this.create({ nickname, phone_id, token: accessToken }).save();
  }

  async setGender(setGenderDto: SetGenderDto, userId: number) {
    const { gender } = setGenderDto;

    return await this.update({ id: userId }, { gender });
  }
}
