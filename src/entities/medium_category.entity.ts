import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { LargeCategory } from './large_category.entity';
import { Clothes } from './clothes.entity';

@Entity({ name: 'medium_category' })
export class MediumCategory extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id', comment: 'PK' })
  id: number;

  @Column({ name: 'name', comment: '중 카테고리 명' })
  name: string;

  @ManyToOne(() => LargeCategory, (largeCategory) => largeCategory.id)
  @JoinColumn({ name: 'large_category_id' })
  large_category: LargeCategory;

  @OneToMany(() => Clothes, (clothes) => clothes.medium_category)
  clothes: Clothes[];
}
