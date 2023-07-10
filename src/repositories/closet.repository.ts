import { Injectable } from '@nestjs/common';
import { Type } from 'src/entities/type.entity';
import { Closet } from 'src/entities/closet.entity';
import { DataSource, Repository } from 'typeorm';
import { ClosetType } from 'src/entities/closet_type.entity';

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
}
