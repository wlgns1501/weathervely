import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'temperature' })
export class Temperature {
  @PrimaryGeneratedColumn({ name: 'id', comment: 'PK' })
  id: number;

  @Column({ name: 'temperature', comment: '온도' })
  temperature: number;
}
