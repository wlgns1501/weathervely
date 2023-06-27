import {
  BaseEntity,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Closet } from './closet.entity';
import { Option } from './option.entity';
import { Clothes } from './clothes.entity';

@Entity({ name: 'clothes_option' })
export class ClothesOption extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id', comment: 'PK' })
  id: number;

  @ManyToOne(() => Clothes, (clothes) => clothes.id)
  @JoinColumn({ name: 'clothes_id' })
  clothes: Clothes;

  @ManyToOne(() => Option, (option) => option.id)
  @JoinColumn({ name: 'option_id' })
  option: Option;
}
