import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserPickWeather } from './user_pick_weather.entity';
import { UserPickStyle } from './user_pick_style.entity';
import { UserWithAddress } from './user_with_address.entity';
import { UserSetStyle } from './user_set_style.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'user' })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id', comment: 'PK' })
  @ApiProperty({ description: 'userId' })
  id: number;

  @Column({ name: 'nickname', comment: '닉네임', length: 10, unique: true })
  @ApiProperty({
    description: 'nickName',
    nullable: false,
    required: true,
    example: 'abcde',
    maxLength: 10,
  })
  nickname: string;

  @Column({
    name: 'gender',
    comment: '성별',
    default: 'female',
    nullable: true,
  })
  @ApiProperty({
    description: '성별',
    nullable: true,
    required: false,
    default: 'female',
    example: 'female',
  })
  gender: string;

  @Column({ name: 'token', comment: 'token' })
  token: string;

  @CreateDateColumn({ name: 'createdAt', comment: '생성 시간' })
  createdAt: Date;

  @OneToMany(() => UserWithAddress, (userWithAddress) => userWithAddress.user)
  user_with_address: UserWithAddress[];

  @OneToMany(() => UserPickWeather, (userPickWeather) => userPickWeather.user)
  user_pick_weather: UserPickWeather[];

  @OneToMany(() => UserPickStyle, (userPickStyle) => userPickStyle.user)
  user_pick_style: UserPickStyle[];

  @OneToMany(() => UserSetStyle, (userSetStyle) => userSetStyle.user)
  user_set_style: UserSetStyle[];
}
