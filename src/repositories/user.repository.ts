import { Injectable } from '@nestjs/common';
import { Address } from 'src/entities/address.entity';
import { User } from 'src/entities/user.entity';
import { UserWithAddress } from 'src/entities/user_with_address.entity';
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

  async deleteUser(userId: number) {
    return await this.delete({ id: userId });
  }

  async getUserAddresses(userId: number) {
    // const query = this.createQueryBuilder('u')
    //   .leftJoinAndSelect(
    //     (subQuery) =>
    //       subQuery
    //         .from(Address, 'a')
    //         .leftJoin(UserWithAddress, 'uwa', 'uwa.address_id = a.id'),
    //     'a',
    //   )
    //   .addSelect('a.id', 'a_id')
    //   .addSelect('a.address_name', 'address_name')
    //   .addSelect('a.is_main_address', 'is_main_address')
    //   .where('u.id = :user_id', { user_id: userId });

    return await this.query(
      `
      select
        a.id,
        a.address_name,
        case when a.is_main_address = 0 then 'false'
        else 'true' end as is_main_address
        
      FROM 
        user u 
      left join lateral(
        select
          a.id,
          a.address_name,
          uwa.is_main_address
        FROM 
          address a 
        left join user_with_address uwa on uwa.address_id = a.id 
      WHERE 
        uwa.user_id = u.id
      ) a on true
      where
        u.id = ?`,
      [userId],
    );

    // const result = await query.getRawMany();

    // return result;
  }
}
