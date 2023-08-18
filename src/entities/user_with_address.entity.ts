import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Address } from './address.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'user_with_address' })
@Unique(['user', 'address'])
export class UserWithAddress extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id', comment: 'PK' })
  id: number;

  //   @Column({ name: 'sensory_temp', comment: '체감 온도' })
  //   sensory_temp: number;

  @ApiProperty({ description: 'is_main_address', default: true })
  @Column({ name: 'is_main_address', comment: '대표 주소' })
  is_main_address: boolean;

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
  @Column()
  address_id: number;

  @OneToMany(() => UserWithAddress, (userWithAddress) => userWithAddress.user)
  user_with_address: UserWithAddress[];
}
