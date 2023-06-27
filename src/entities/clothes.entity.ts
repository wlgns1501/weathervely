import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MediumCategory } from './medium_category.entity';
import { ClosetClothes } from './closet_clothes.entity';
import { ClothesOptions } from './clothes_options.entity';

@Entity({ name: 'clothes' })
export class Clothes extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id', comment: 'PK' })
  id: number;

  @Column({ name: 'name', comment: '의류 이름' })
  name: string;

  @Column({ name: 'item_code', comment: '아이템 코드' })
  item_code: string;

  @ManyToOne(() => MediumCategory, (mediumCategory) => mediumCategory.id)
  @JoinColumn({ name: 'medium_category_id' })
  medium_category: MediumCategory;

  @OneToMany(() => ClothesOptions, (clothesOptions) => clothesOptions.id)
  clothesOptions: ClothesOptions[];

  @OneToMany(() => ClosetClothes, (closetClothes) => closetClothes.clothes)
  closet_clothes: ClosetClothes[];
}
