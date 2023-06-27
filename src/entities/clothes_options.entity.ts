import {
  BaseEntity,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Options } from './options.entity';
import { Clothes } from './clothes.entity';

@Entity({ name: 'clothes_options' })
export class ClothesOptions extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id', comment: 'PK' })
  id: number;

  @ManyToOne(() => Clothes, (clothes) => clothes.id)
  @JoinColumn({ name: 'clothes_id' })
  clothes: Clothes;

  @ManyToOne(() => Options, (options) => options.id)
  @JoinColumn({ name: 'options_id' })
  options: Options;
}
