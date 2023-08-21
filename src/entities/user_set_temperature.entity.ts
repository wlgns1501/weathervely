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

@Entity({ name: 'user_set_temperature' })
export class UserSetTemperature extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id', comment: 'PK' })
  id: number;

  @ManyToOne(() => User, (user) => user.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;
  @Column()
  user_id: number;

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

  @ApiProperty({
    description: 'current_temperature',
    nullable: false,
    required: true,
    example: '25',
  })
  @Column({ name: 'current_temperature', comment: '현재 온도' })
  current_temperature: string;

  @ApiProperty({
    description: 'sensory_temperature',
    nullable: false,
    required: true,
    example: '29',
  })
  @Column({
    name: 'sensory_temperature',
    comment: '선택한 옷의 온도 구간 평균',
  })
  sensory_temperature: string;

  @CreateDateColumn({ name: 'created_at', comment: '생성일자' })
  created_at: Date;
}
