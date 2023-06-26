import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Address } from './address.entity';

@Entity({ name: 'user_with_address' })
export class UserWithAddress extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id', comment: 'PK' })
  id: number;

  @Column({ name: 'sensory_temp', comment: '체감 온도' })
  sensory_temp: number;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Address, (address) => address.id)
  @JoinColumn({ name: 'addressId' })
  address: Address;

  @OneToMany(() => UserWithAddress, (userWithAddress) => userWithAddress.user)
  user_with_address: UserWithAddress[];
}
