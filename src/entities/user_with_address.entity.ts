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

@Entity({ name: 'user_with_address' })
@Unique(['user', 'address'])
export class UserWithAddress extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id', comment: 'PK' })
  id: number;

  //   @Column({ name: 'sensory_temp', comment: '체감 온도' })
  //   sensory_temp: number;

  @ManyToOne(() => User, (user) => user.id)
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
