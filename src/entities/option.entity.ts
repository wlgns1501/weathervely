import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Clothes } from './clothes.entity';
import { ClothesOption } from './clothes_option.entity';

@Entity({ name: 'option' })
export class Option extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id', comment: 'PK' })
  id: number;

  @Column({ name: 'name', comment: 'name' })
  name: string;

  @OneToMany(() => ClothesOption, (clothesOption) => clothesOption.option)
  clothesOptions: ClothesOption[];
}
