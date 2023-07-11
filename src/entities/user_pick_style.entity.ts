import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Closet } from './closet.entity';

@Entity({ name: 'user_pick_style' })
export class UserPickStyle extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id', comment: 'PK' })
  id: number;

  @Column({ name: 'casual', comment: '캐주얼 선택한 수' })
  casual: number;

  @Column({ name: 'formal', comment: '포멀 선택한 수' })
  formal: number;

  @Column({ name: 'unisex', comment: '유니섹스 선택한 수' })
  unisex: number;

  @Column({ name: 'feminine', comment: '페미닌 선택한 수' })
  feminine: number;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
