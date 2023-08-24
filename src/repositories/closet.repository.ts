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
    type_id: any | null,
    user: User,
  ): Promise<any[]> {
    /**
     * 1. closet_id가 있을 경우 그 closet_id의 타입 2개를 갖고옴
     * 2. closet_id가 없을 경우 랜덤의 type 중 2개를 가져옴
     */

    let userSettedTypeQuery;
    let typeQuery;

    // if (type_id == null) {
    //   userSettedTypeQuery = await this.createQueryBuilder()
    //     .select('t.id, t.name')
    //     .from('type', 't')
    //     .where('t.id = coalesce(:type_id, t.id)')
    //     .orderBy('RAND()')
    //     .getQuery();
    // } else {
    //   const typeQuery = `(  ${type_id.type_ids} )`;

    //   userSettedTypeQuery = await this.createQueryBuilder()
    //     .select('t.id, t.name')
    //     .from('type', 't')
    //     .where(`t.id in  ${typeQuery} `)
    //     .limit(2)
    //     .getQuery();
    // }

    if (type_id == null) {
      typeQuery = type_id.type_ids;
    } else {
      typeQuery = type_id.type_ids;
    }

    console.log(typeQuery);

    // const getClosetsQuery = await this.createQueryBuilder()
    //   .select('c.*, ust.name as type_name')
    //   .from('(' + userSettedTypeQuery + ')', 'ust')
    //   .leftJoin(
    //     (subQuery) =>
    //       subQuery
    //         .select('c.*, ct.type_id')
    //         .from('closet', 'c')
    //         .leftJoin('closet_type', 'ct', 'ct.closet_id = c.id'),
    //     'c',
    //     '(ust.id IS NOT NULL AND c.type_id = ust.id) or (ust.id IS NULL AND 1 = 1)',
    //   )
    //   .groupBy('c.id')
    //   .getQuery();

    const getClosetsQuery = `
        SELECT 
          c.*, 
          t.ids,
          t.name as type_name 
        FROM 
          closet c 
        LEFT JOIN lateral (
          SELECT 
            t.id, 
            GROUP_CONCAT(t.id order by t.id) as ids, 
            t.name
          FROM 
            type t
          LEFT JOIN closet_type ct ON ct.type_id = t.id
          WHERE 
            ct.closet_id = c.id
        ) t on true
        HAVING t.ids = '${typeQuery}'
    `;

    const tempRangeIds = await this.createQueryBuilder()
      .select('tr.id')
      .from('temperature_range', 'tr')
      .where(
        'tr.id >= (SELECT MIN(tr2.id) FROM temperature_range tr2 WHERE tr2.min_temp <= :temp and tr2.max_temp > :temp) - 3',
      )
      .andWhere(
        'tr.id <= (SELECT MAX(tr2.id) FROM temperature_range tr2 WHERE tr2.min_temp <= :temp and tr2.max_temp > :temp) + 3',
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
      .addSelect('gc.site_name')
      .addSelect(
        `case when tr.min_temp <= :temp and tr.max_temp > :temp then 'true' else 'false' end`,
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
      .orderBy('tr.id')
      .groupBy('tr.id')
      .setParameter('temp', temperature)
      .setParameter('userId', user.id)
      .setParameter('type_id', type_id);
    return await tempWithClosetQuery.getRawMany();
    // return await this.query(
    //   `
    // with  get_closets as (
    //   select
    //     c.*,
    //     t.name as type_name
    //   FROM
    //     closet c
    //   left join lateral(
    //     select
    //       t.name
    //     FROM
    //       type t
    //     left join closet_type ct on ct.type_id = t.id
    //     WHERE
    //       ct.closet_id = c.id
    //     order by rand()
    //     limit 1

    //   ) t on true

    // ), temp_with_closet as (
    //   SELECT
    //     tr.*,
    //     gc.id as closet_id,
    //     gc.name,
    //     gc.image_url,
    //     gc.site_name,
    //     gc.type_name,
    //     tr.id as temp_id,
    //     case when tr.min_temp <= ? and tr.max_temp > ? then 'true'
    //     else 'false' end as isCurrentTemperature,
    //     ROW_NUMBER () over(order by tr.id desc) as row_num
    //   FROM
    //     temperature_range tr
    //   left join lateral(
    //     select
    //       gc.*
    //     FROM
    //       get_closets gc
    //     left join closet_temperature ct on ct.closet_id = gc.id
    //     WHERE
    //       ct.temp_id = tr.id
    //     order by rand()
    //     limit 1
    //   ) gc on true
    //   where
    //     tr.id is not null AND
    //     tr.id in (
    //         SELECT
    //           tr.id
    //       FROM temperature_range AS tr
    //       WHERE tr.id >= (
    //         SELECT
    //           MIN(tr2.id)
    //         FROM
    //           temperature_range AS tr2
    //         WHERE
    //           ? BETWEEN tr2.min_temp AND tr2.max_temp
    //       ) - 3
    //       AND tr.id <= (
    //         SELECT MAX(tr2.id)
    //         FROM temperature_range AS tr2
    //         WHERE ? BETWEEN tr2.min_temp AND tr2.max_temp
    //       ) + 3
    //       ORDER BY tr.id desc
    //     )
    //   order by rand() and tr.id desc
    // ), get_data as (
    //   select
    //     twc.id,
    //     twc.name,
    //     twc.min_temp,
    //     twc.max_temp,
    //     twc.image_url,
    //     twc.site_name,
    //     twc.type_name,
    //     twc.isCurrentTemperature,
    //     twc.closet_id,
    //     twc.temp_id
    //   FROM
    //     temp_with_closet twc
    //   order by row_num asc
    // )
    // select * from get_data
    //   `,
    //   [temperature, temperature, temperature, temperature],
    // );
  }

  async getRecommendCloset(temperature: number) {
    const queryBuilder = await this.createQueryBuilder('closet')
      .select('closet.*')
      .innerJoin('closet.closetTemperature', 'ct')
      .innerJoin('ct.temperatureRange', 'tr')
      .where('tr.min_temp <= :temperature and tr.max_temp > :temperature', {
        temperature,
      })
      .orderBy('rand()');
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
