import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Address } from './address.entity';

@Entity({ name: 'forecast' })
export class Forecast extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id', comment: 'PK' })
  id: number;

  @Column({ name: 'temperature', comment: '기온' })
  temperature: number;

  @Column({ name: 'weather_type', comment: '날씨' })
  wether_type: string;

  @Column({ name: 'forecast_date', comment: '측정 날짜' })
  forecast_date: Date;

  @ManyToOne(() => Address, (address) => address.id)
  @JoinColumn({ name: 'address_id' })
  address_id: Address;
}
