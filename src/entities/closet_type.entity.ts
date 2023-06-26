import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'closet_type' })
export class ClosetType extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id', comment: 'PK' })
  id: number;

  @Column({ name: 'name', comment: 'type 이름' })
  name: string;

  @Column({ name: 'isShow', comment: 'isShow' })
  isShow: boolean;
}
