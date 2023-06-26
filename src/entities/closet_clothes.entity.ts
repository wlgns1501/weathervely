import {
  BaseEntity,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Closet } from './closet.entity';
import { Clothes } from './clothes.entity';

@Entity({ name: 'closet_clothes' })
export class ClosetClothes extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id', comment: 'PK' })
  id: number;

  @ManyToOne(() => Closet, (closet) => closet.id)
  @JoinColumn({ name: 'closet_id' })
  closet: Closet;

  @ManyToOne(() => Clothes, (clothes) => clothes.id)
  @JoinColumn({ name: 'clothes_id' })
  clothes: Clothes;
}
