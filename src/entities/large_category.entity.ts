import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MediumCategory } from './medium_category.entity';

@Entity({ name: 'large_category' })
export class LargeCategory extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id', comment: 'PK' })
  id: number;

  @Column({ name: 'name', comment: '대분류 카테고리 명' })
  name: string;

  @OneToMany(
    () => MediumCategory,
    (mediumCategory) => mediumCategory.large_category,
  )
  medium_category: MediumCategory[];
}
