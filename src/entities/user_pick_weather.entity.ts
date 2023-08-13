import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Address } from './address.entity';
import { Closet } from './closet.entity';
import { TemperatureRange } from './temperature_range.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'user_pick_weather' })
export class UserPickWeather extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id', comment: 'PK' })
  id: number;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Address, (address) => address.id)
  @JoinColumn({ name: 'address_id' })
  address: Address;

  @ApiProperty({
    description: 'closet_id',
    nullable: false,
    required: true,
    example: '7',
  })
  @ManyToOne(() => Closet, (closet) => closet.id)
  @JoinColumn({ name: 'closet_id' })
  closet: Closet;

  @ManyToOne(() => TemperatureRange, (temperatureRange) => temperatureRange.id)
  @JoinColumn({ name: 'temp_id' })
  temperatureRange: TemperatureRange;

  @CreateDateColumn({ name: 'created_at', comment: '생성일자' })
  created_at: Date;

  @ApiProperty({
    description: 'temperature',
    nullable: false,
    required: true,
    example: '25',
  })
  @Column({ name: 'temperature', comment: '온도' })
  temperature: string;
}
