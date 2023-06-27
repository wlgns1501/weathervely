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

  @Column({ name: 'cj_type_count', comment: '캐주얼 선택한 수' })
  cj_type_count: number;

  @Column({ name: 'fm_type_count', comment: '포멀 선택한 수' })
  fm_type_count: number;

  @Column({ name: 'uni_type_count', comment: '유니섹스 선택한 수' })
  uni_type_count: number;

  @Column({ name: 'pe_type_count', comment: '페미닌 선택한 수' })
  pe_type_count: number;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
