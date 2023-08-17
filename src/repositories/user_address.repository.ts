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

  async getUserAddresses(user: User) {
    return await this.createQueryBuilder('awd')
      .where({
        user,
      })
      .leftJoinAndSelect('awd.address', 'a')
      .getOne();
  }

  async createUserWithAddress(user: User, address: Address) {
    return await this.create({ user, address, is_main_address: true }).save();
  }

  async addUserWithAddress(user: User, address: Address) {
    return await this.create({ user, address, is_main_address: false }).save();
  }

  async updateUserWithAddress(
    userId: number,
    updateAddressId: number,
    addressId: number,
  ) {
    return await this.createQueryBuilder('uwa')
      .update()
      .set({ address_id: updateAddressId })
      .where({ user_id: userId })
      .andWhere({ address_id: addressId })
      .execute();
  }

  async deleteUserAddress(addressId: number, userId: number) {
    return await this.createQueryBuilder('uwa')
      .delete()
      .from(UserWithAddress)
      .where({ user_id: userId, address_id: addressId })
      .execute();
  }

  async settedMainAddress(userId: number, addressId: number) {
    return await this.update(
      { address_id: addressId, user_id: userId },
      { is_main_address: true },
    );
  }

  async settedNotMainAddress(userId: number, addressId: number) {
    return await this.update(
      { address_id: addressId, user_id: userId },
      { is_main_address: false },
    );
  }
}
