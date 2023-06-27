import {
  BaseEntity,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Closet } from './closet.entity';

@Entity({ name: 'user_set_style' })
export class UserSetStyle extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id', comment: 'PK' })
  id: number;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Closet, (closet) => closet.id)
  @JoinColumn({ name: 'closet_id' })
  closet: Closet;
}
