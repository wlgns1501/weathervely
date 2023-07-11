import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { UserWithAddress } from './user_with_address.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'address' })
@Unique(['address_name', 'postal_code'])
export class Address extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id', comment: 'PK' })
  id: number;

  @ApiProperty({
    description: 'address_name',
    nullable: false,
    required: true,
    example: '서울특별시 종로구 종로 19',
  })
  @Column({ name: 'address_name', comment: '주소' })
  address_name: string;

  @ApiProperty({
    description: 'city',
    nullable: false,
    required: true,
    example: '서울특별시',
  })
  @Column({ name: 'city', comment: '도시명' })
  city: string;

  @ApiProperty({
    description: 'gu',
    nullable: false,
    required: true,
    example: '종로구',
  })
  @Column({ name: 'gu', comment: 'gu' })
  gu: string;

  @ApiProperty({
    description: 'dong',
    nullable: false,
    required: true,
    example: '청진동',
  })
  @Column({ name: 'dong', comment: 'dong' })
  dong: string;

  @ApiProperty({
    description: 'postal_code',
    nullable: false,
    required: true,
    example: '03190',
  })
  @Column({ name: 'postal_code', comment: '우편번호' })
  postal_code: string;

  @ApiProperty({
    description: 'country',
    nullable: false,
    required: true,
    example: 'kr',
  })
  @Column({ name: 'country', comment: '나라명' })
  country: string;

  @ApiProperty({
    description: 'x_code',
    nullable: false,
    required: true,
    example: '37.570654',
  })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 8,
    name: 'x_code',
    comment: '위도',
  })
  x_code: number;

  @ApiProperty({
    description: 'y_code',
    nullable: false,
    required: true,
    example: '126.979893',
  })
  @Column({
    type: 'decimal',
    precision: 11,
    scale: 8,
    name: 'y_code',
    comment: '경도',
  })
  y_code: number;

  @OneToMany(
    () => UserWithAddress,
    (userWithAddress) => userWithAddress.address,
  )
  user_with_address: UserWithAddress[];
}
