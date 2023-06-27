import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ClosetType } from './closet_type.entity';

@Entity({ name: 'type' })
export class Type extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id', comment: 'PK' })
  id: number;

  @Column({ name: 'name', comment: '타입 이름' })
  type: string;

  @OneToMany(() => ClosetType, (closetType) => closetType.type)
  closetTypes: ClosetType[];
}
