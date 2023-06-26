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

@Entity({ name: 'user' })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id', comment: 'PK' })
  id: number;

  @Column({ name: 'nickname', comment: '닉네임', length: 5, unique: true })
  nickname: string;

  @Column({ name: 'gender', comment: '성별' })
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
}
