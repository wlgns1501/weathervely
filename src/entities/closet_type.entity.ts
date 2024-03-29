import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Closet } from './closet.entity';
import { Type } from './type.entity';

@Entity({ name: 'closet_type' })
export class ClosetType extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id', comment: 'PK' })
  id: number;

  @ManyToOne(() => Closet, (closet) => closet.id)
  @JoinColumn({ name: 'closet_id' })
  closet: Closet;

  @ManyToOne(() => Type, (type) => type.id)
  @JoinColumn({ name: 'type_id' })
  type: Type;
}
