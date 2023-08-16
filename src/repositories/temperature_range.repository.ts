import { Injectable } from '@nestjs/common';
import { DataSource, ObjectLiteral, Repository, getRepository } from 'typeorm';
import { TemperatureRange } from 'src/entities/temperature_range.entity';
import { Closet } from 'src/entities/closet.entity';

@Injectable()
export class TemperatureRangeRepository extends Repository<TemperatureRange> {
  constructor(private dataSource: DataSource) {
    super(TemperatureRange, dataSource.createEntityManager());
  }

  async getTemperatureId(closet_id: Closet | number) {
    console.log('getTemperatureId', closet_id);
    return await this.createQueryBuilder('tr')
      .leftJoin('closet_temperature', 'ctemp', 'ctemp.temp_id = tr.id')
      .where('ctemp.closet_id = :closetId', { closetId: closet_id })
      .getOne();
  }

  async getAverageTemp(closet_id: Closet | number) {
    return await this.createQueryBuilder()
      .select('(tr.min_temp + tr.max_temp) / 2 as avg_temp ')
      .from('temperature_range', 'tr')
      .leftJoin('closet_temperature', 'ctemp', 'ctemp.temp_id = tr.id')
      .where('ctemp.closet_id = :closetId', { closetId: closet_id })
      .getRawOne();
  }
}
