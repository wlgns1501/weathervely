import { Injectable } from '@nestjs/common';
import { SetAddressDto } from 'src/v1/auth/dtos/setAddress.dto';
import { Address } from 'src/entities/address.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class AddressRepository extends Repository<Address> {
  constructor(private dataSource: DataSource) {
    super(Address, dataSource.createEntityManager());
  }

  async getAddressById(addressId: number) {
    return await this.find({ where: { id: addressId } });
  }

  async getAddress(setAddressDto: SetAddressDto): Promise<Address | null> {
    const { address_name } = setAddressDto;

    return await this.findOne({
      where: {
        address_name,
      },
    });
  }

  async createAddress(setAddressDto: SetAddressDto) {
    return await this.create({ ...setAddressDto }).save();
  }

  async getUserMainAddresses(userId: number) {
    return await this.createQueryBuilder('a')
      .leftJoin('user_with_address', 'uwa', 'uwa.address_id = a.id')
      .leftJoin('user', 'u', 'uwa.user_id = u.id')
      .where('u.id = :userId', { userId })
      .andWhere('uwa.is_main_address = :is_main_address', {
        is_main_address: true,
      })
      .getMany();
  }
}
