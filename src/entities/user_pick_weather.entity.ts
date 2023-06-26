import {
  BaseEntity,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Address } from './address.entity';
import { Closet } from './closet.entity';

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

  @ManyToOne(() => Closet, (closet) => closet.id)
  @JoinColumn({ name: 'minimum_temperature_clothing_id' })
  minimum_temperature_closet: Closet;

  @ManyToOne(() => Closet, (closet) => closet.id)
  @JoinColumn({ name: 'maximum_temperature_clothing_id' })
  maximum_temperature_closet: Closet;

  @CreateDateColumn({ name: 'created_at', comment: '생성일자' })
  created_at: Date;
}
