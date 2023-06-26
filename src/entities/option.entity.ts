import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Clothes } from './clothes.entity';

@Entity({ name: 'option' })
export class Option extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id', comment: 'PK' })
  id: number;

  @Column({ name: 'name', comment: 'name' })
  name: string;

  @OneToMany(() => Clothes, (clothes) => clothes.option)
  clothes: Clothes[];
}
