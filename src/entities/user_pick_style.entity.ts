import {
  BaseEntity,
  Column,
  CreateDateColumn,
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

  @CreateDateColumn({ name: 'createdAt', comment: '생성일자' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;
  @Column()
  user_id: number;

  @ManyToOne(() => Closet, (closet) => closet.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'closet_id' })
  closet: Closet;
  @Column()
  closet_id: number;
}
