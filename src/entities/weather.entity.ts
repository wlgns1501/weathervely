import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'weather' })
export class Weather extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id', comment: 'PK' })
  id: number;

  @Column({ name: 'date', comment: '날짜' })
  date: Date;

  @Column({ name: 'minimum_temperature', comment: '최저 기온' })
  minimum_temperature: number;

  @Column({ name: 'highest_temperature', comment: '최고 기온' })
  highest_temperature: number;
}
