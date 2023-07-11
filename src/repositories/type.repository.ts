import { Injectable } from '@nestjs/common';
import { Type } from 'src/entities/type.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class TypeRepository extends Repository<Type> {
  constructor(private dataSource: DataSource) {
    super(Type, dataSource.createEntityManager());
  }

  async getTypeList() {
    return await this.find();
  }
}
