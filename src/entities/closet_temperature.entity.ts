import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Closet } from './closet.entity';
import { TemperatureRange } from './temperature_range.entity';

@Entity({ name: 'closet_temperature' })
export class ClosetTemperature extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id', comment: 'PK' })
  id: number;

  @ManyToOne(() => Closet, (closet) => closet.id)
  @JoinColumn({ name: 'closet_id' })
  closet: Closet;

  @ManyToOne(() => TemperatureRange, (temperatureRange) => temperatureRange.id)
  @JoinColumn({ name: 'temp_id' })
  temperatureRange: TemperatureRange;
}
