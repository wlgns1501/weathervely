import { Injectable } from '@nestjs/common';
import { Type } from 'src/entities/type.entity';
import { Closet } from 'src/entities/closet.entity';
import { DataSource, ObjectLiteral, Repository, getRepository } from 'typeorm';
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

  async getClosetByTemperature(
    temperature: number,
    type_id: number,
    user: User,
  ): Promise<any[]> {
    const userSettedTypeQuery = await this.createQueryBuilder()
      .select('t.id, t.name')
      .from('type', 't')
      .where('t.id = coalesce(:type_id, t.id)')
      .orderBy('RAND()')
      .limit(1)
      .getQuery();

    const getClosetsQuery = await this.createQueryBuilder()
      .select('c.*, ust.name as type_name')
      .from('(' + userSettedTypeQuery + ')', 'ust')
      .leftJoin(
        (subQuery) =>
          subQuery
            .select('c.*, ct.type_id')
            .from('closet', 'c')
            .leftJoin('closet_type', 'ct', 'ct.closet_id = c.id'),
        'c',
        '(ust.id IS NOT NULL AND c.type_id = ust.id) or (ust.id IS NULL AND 1 = 1)',
      )
      .groupBy('c.id')
      .getQuery();

    const tempRangeIds = await this.createQueryBuilder()
      .select('tr.id')
      .from('temperature_range', 'tr')
      .where(
        'tr.id >= (SELECT MIN(tr2.id) FROM temperature_range tr2 WHERE :temp BETWEEN tr2.min_temp AND tr2.max_temp) - 3',
      )
      .andWhere(
        'tr.id <= (SELECT MAX(tr2.id) FROM temperature_range tr2 WHERE :temp BETWEEN tr2.min_temp AND tr2.max_temp) + 3',
      )
      .groupBy('tr.id')
      .orderBy('tr.id')
      .setParameter('temp', temperature)
      .getRawMany();

    const tempWithClosetQuery = await this.createQueryBuilder()
      .select('tr.*')
      .addSelect('gc.id', 'closet_id')
      .addSelect('gc.name')
      .addSelect('gc.image_url')
      .addSelect('gc.type_name')
      .addSelect('gc.temp_id')
      .addSelect(
        `case when :temp between tr.min_temp and tr.max_temp then 'true' else 'false' end`,
        'isCurrentTemperature',
      )
      .from('temperature_range', 'tr')
      .leftJoin(
        (subQuery) =>
          subQuery
            .select(
              'gc.*, ct.temp_id, row_number() over (partition by ct.temp_id order by rand()) as rn',
            )
            .from('(' + getClosetsQuery + ')', 'gc')
            .leftJoin('closet_temperature', 'ct', 'ct.closet_id = gc.id'),
        'gc',
        'tr.id = gc.temp_id and gc.rn = 1',
      )
      .where('tr.id IS NOT NULL')
      .andWhere('tr.id IN (:tempIds)', {
        tempIds: tempRangeIds.map((it) => it.tr_id),
      })
      .groupBy('tr.id')
      .setParameter('temp', temperature)
      .setParameter('userId', user.id)
      .setParameter('type_id', type_id);

    return await tempWithClosetQuery.getRawMany();
  }

  async getRecommendCloset(temperature: number) {
    const queryBuilder = await this.createQueryBuilder('closet')
      .select('closet.*')
      .innerJoin('closet.closetTemperature', 'ct')
      .innerJoin('ct.temperatureRange', 'tr')
      .where(':temperature between tr.min_temp and tr.max_temp', {
        temperature,
      });
    return queryBuilder.getRawMany();
  }

  // async getCloset(temperature: number) {
  //   const queryBuilder = await this.createQueryBuilder('closet')
  //     .select('closet.id', 'id')
  //     .addSelect('closet.name', 'name')
  //     .addSelect('closet.site_name', 'siteName')
  //     .addSelect('closet.site_url', 'siteUrl')
  //     .addSelect('closet.image_url', 'imageUrl')
  //     .addSelect('type.name', 'typeName')
  //     .innerJoin('closet.closetTypes', 'closetType')
  //     .innerJoin('closetType.type', 'type')
  //     .where(':temperature BETWEEN closet.min_temp AND closet.max_temp', {
  //       temperature,
  //     })
  //     //   .andWhere('t.name = :type', { type: type })
  //     .andWhere('closet.status = :status', { status: 'Active' })
  //     .groupBy('closet.id');
  //   //   .orderBy('RAND()')
  //   //   .limit(1);
  //   return queryBuilder.getRawMany();
  // }
}
