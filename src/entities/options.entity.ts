import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ClothesOptions } from './clothes_options.entity';

@Entity({ name: 'options' })
export class Options extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id', comment: 'PK' })
  id: number;

  @Column({ name: 'name', comment: 'name' })
  name: string;

  @OneToMany(() => ClothesOptions, (clothesOptions) => clothesOptions.options)
  clothesOptions: ClothesOptions[];
}
