import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserSetTemperature } from './user_set_temperature.entity';
import { UserPickStyle } from './user_pick_style.entity';
import { UserWithAddress } from './user_with_address.entity';
import { UserSetStyle } from './user_set_style.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

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
    example: 'test1',
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

  @Column({ name: 'phone_id', comment: '기기 고유번호' })
  phone_id: string;

  @Exclude()
  @Column({ name: 'token', comment: 'token' })
  token: string;

  @CreateDateColumn({ name: 'createdAt', comment: '생성 시간' })
  createdAt: Date;

  @OneToMany(() => UserWithAddress, (userWithAddress) => userWithAddress.user, {
    onDelete: 'CASCADE',
  })
  user_with_address: UserWithAddress[];

  @OneToMany(
    () => UserSetTemperature,
    (userSetTemperature) => userSetTemperature.user,
    {
      onDelete: 'CASCADE',
    },
  )
  user_set_temperature: UserSetTemperature[];

  @OneToMany(() => UserPickStyle, (userPickStyle) => userPickStyle.user, {
    onDelete: 'CASCADE',
  })
  user_pick_style: UserPickStyle[];

  @OneToMany(() => UserSetStyle, (userSetStyle) => userSetStyle.user, {
    onDelete: 'CASCADE',
  })
  user_set_style: UserSetStyle[];
}
