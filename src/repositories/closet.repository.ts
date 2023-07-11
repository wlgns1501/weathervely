import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Closet } from 'src/entities/closet.entity';
// import { Address } from 'src/entities/address.entity';
// import { User } from 'src/entities/user.entity';

@Injectable()
export class ClosetRepository extends Repository<Closet> {
  constructor(private dataSource: DataSource) {
    super(Closet, dataSource.createEntityManager());
  }

  async getCloset(temperature: number) {
    const queryBuilder = await this.createQueryBuilder('closet')
      .select('closet.id', 'id')
      .addSelect('closet.name', 'name')
      .addSelect('closet.site_name', 'siteName')
      .addSelect('closet.site_url', 'siteUrl')
      .addSelect('closet.image_url', 'imageUrl')
      .addSelect('type.name', 'typeName')
      .innerJoin('closet.closetTypes', 'closetType')
      .innerJoin('closetType.type', 'type')
      .where(':temperature BETWEEN closet.min_temp AND closet.max_temp', {
        temperature,
      })
      //   .andWhere('t.name = :type', { type: type })
      .andWhere('closet.status = :status', { status: 'Active' })
      .groupBy('closet.id');
    //   .orderBy('RAND()')
    //   .limit(1);
    return queryBuilder.getRawMany();
  }
}
