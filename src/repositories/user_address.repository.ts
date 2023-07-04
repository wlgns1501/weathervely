import { UserWithAddress } from 'src/entities/user_with_address.entity';
import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Address } from 'src/entities/address.entity';
import { User } from 'src/entities/user.entity';

@Injectable()
export class UserAddressRepository extends Repository<UserWithAddress> {
  constructor(private dataSource: DataSource) {
    super(UserWithAddress, dataSource.createEntityManager());
  }

  async getUserAddress(user: User) {
    return await this.createQueryBuilder('awd')
      .where({
        user,
      })
      .leftJoinAndSelect('awd.address', 'a')
      .getOne();
  }

  async createUserWithAddress(user: User, address: Address) {
    return await this.create({ user, address }).save();
  }
}
