import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserWithAddress } from './user_with_address.entity';

@Entity({ name: 'address' })
export class Address extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id', comment: 'PK' })
  id: number;

  @Column({ name: 'address_name', comment: '주소' })
  address_name: string;

  @Column({ name: 'city', comment: '도시명' })
  city: string;

  @Column({ name: 'postal_code', comment: '우편번호' })
  postal_code: string;

  @Column({ name: 'country', comment: '나라명' })
  country: string;

  @Column({ name: 'x_code', comment: '위도' })
  x_code: number;

  @Column({ name: 'y_code', comment: '경도' })
  y_code: number;

  @OneToMany(
    () => UserWithAddress,
    (userWithAddress) => userWithAddress.address,
  )
  user_with_address: UserWithAddress[];
}
