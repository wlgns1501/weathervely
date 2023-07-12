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

  async getRecommendClosetByTemperature(
    temperature: number,
    user: User,
  ): Promise<Closet | undefined> {
    const query = this.createQueryBuilder('closet')
      .select('tr.id', 'tempId')
      .addSelect('tr.min_temp', 'minTemp')
      .addSelect('tr.max_temp', 'maxTemp')
      .addSelect('closet.id', 'closetId')
      .addSelect('closet.name', 'closetName')
      .addSelect('closet.site_name', 'siteName')
      .addSelect('closet.site_url', 'siteUrl')
      .addSelect('closet.image_url', 'imageUrl')
      .addSelect('closet.status', 'status')
      .addSelect('t.id', 'typeId')
      .addSelect('t.name', 'typeName')
      .innerJoin('closet.closet_temperature', 'ctemp')
      .innerJoin('ctemp.temp', 'tr')
      .innerJoin('closet.closet_type', 'ct')
      .innerJoin('ct.type', 't')
      .innerJoin(
        `(SELECT t.id AS typeId, t.name AS typeName, f.favoritTypeClosetCount
          FROM type t
          LEFT OUTER JOIN (
            SELECT ct.type_id, COUNT(ct.closet_id) AS favoritTypeClosetCount
            FROM user_set_style ust
            JOIN user u ON u.id = ust.user_id
            JOIN closet c ON c.id = ust.closet_id
            JOIN closet_type ct ON ct.closet_id = c.id
            WHERE u.id = :userId
            GROUP BY ct.type_id
          ) f ON f.type_id = t.id
          ORDER BY favoritTypeClosetCount DESC, RAND()
          LIMIT 1
        )`,
        'f',
        'f.typeId = t.id',
      )
      .where(':temperature BETWEEN tr.min_temp AND tr.max_temp')
      .orderBy('RAND()')
      .setParameters({ userId: user.id, temperature })
      .limit(1);

    return await query.getRawOne();
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
