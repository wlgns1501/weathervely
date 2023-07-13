import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ClosetTemperature } from './closet_temperature.entity';

@Entity({ name: 'temperature_range' })
export class TemperatureRange extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id', comment: 'PK' })
  id: number;

  @Column({ name: 'min_temp', comment: '최저 온도' })
  min_temp: string;

  @Column({ name: 'max_temp', comment: '최고 온도' })
  max_temp: string;

  @OneToMany(
    () => ClosetTemperature,
    (closetTemperature) => closetTemperature.temperatureRange,
  )
  closetTemperature: ClosetTemperature[];
}
