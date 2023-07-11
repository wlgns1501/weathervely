import { Injectable } from '@nestjs/common';
import { Type } from 'src/entities/type.entity';
import { Closet } from 'src/entities/closet.entity';
import { DataSource, Repository } from 'typeorm';
import { ClosetType } from 'src/entities/closet_type.entity';
import { Address } from 'src/entities/address.entity';
import { User } from 'src/entities/user.entity';

@Injectable()
export class ClosetRepository extends Repository<Closet> {
  constructor(private dataSource: DataSource) {
    super(Closet, dataSource.createEntityManager());
  }

  async getClosetList() {
    return await this.createQueryBuilder('c')
      .select([
        'c.id as id',
        'c.name as name',
        'c.image_url as image_url',
        'c.status as status',
        'JSON_ARRAYAGG( JSON_OBJECT("id", t.id, "name",  t.name )) as types',
      ])
      .leftJoin('closet_type', 'ct', 'ct.closet_id = c.id')
      .leftJoin('type', 't', 't.id = ct.type_id')
      .where('c.status = :status', { status: 'Active' })
      .groupBy('c.id')
      .getRawMany();
  }

  async getClosetById(closet_id: number) {
    return await this.createQueryBuilder().where({ id: closet_id }).getOne();
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
