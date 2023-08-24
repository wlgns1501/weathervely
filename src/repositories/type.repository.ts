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
      .select('group_concat(t.id) as type_ids')
      .leftJoin('closet_type', 'ct', 'ct.type_id = t.id')
      .where('ct.closet_id = :closetId', { closetId: closet_id })
      .getRawOne();
  }

  // async fromTypeQuery() {
  //   return await this.createQueryBuilder('t')
  //     .select('DISTINCT(t.id) as type_id')
  //     .orderBy('rand()')
  //     .limit(2)
  //     .getQuery();
  // }

  async typeQuery() {
    const fromTypeQuery1 = `
      
        SELECT
          t.id as type_id
        FROM 
          type t 
        where
          t.id in (1,2)
        ORDER BY rand() ASC 
        LIMIT 1
      `;

    const fromTypeQuery2 = `
        
          SELECT
            t.id as type_id
          FROM 
            type t
          where
            t.id in (3,4)
          ORDER BY rand() ASC 
          LIMIT 1
        
      `;

    return await this.createQueryBuilder()
      .select(`concat(type1.type_id,',', type2.type_id ) as type_ids`)
      .from('(' + fromTypeQuery1 + ')', 'type1')
      .addFrom('(' + fromTypeQuery2 + ')', 'type2')
      .getRawOne();
  }
}
