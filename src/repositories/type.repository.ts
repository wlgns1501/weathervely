import { Injectable } from '@nestjs/common';
import { Type } from 'src/entities/type.entity';
import { DataSource, Repository } from 'typeorm';
import { Closet } from 'src/entities/closet.entity';

@Injectable()
export class TypeRepository extends Repository<Type> {
  constructor(private dataSource: DataSource) {
    super(Type, dataSource.createEntityManager());
  }

  async getTypeList() {
    return await this.find();
  }

  async getTypeId(closet_id: Closet | number) {
    return await this.createQueryBuilder('t')
      .leftJoin('closet_type', 'ct', 'ct.type_id = t.id')
      .where('ct.closet_id = :closetId', { closetId: closet_id })
      .getOne();
  }
}
