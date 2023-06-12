import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'closet' })
export class Closet {
  @PrimaryGeneratedColumn({ name: 'id', comment: 'PK' })
  id: number;

  @Column({ name: 'type', comment: '타입' })
  type: string;

  @Column({ name: 'closet_image_url', comment: '옷 이미지 url' })
  closet_image_url: string;
}
