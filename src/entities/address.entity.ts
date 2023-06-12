import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'address' })
export class Address {
  @PrimaryGeneratedColumn({ name: 'id', comment: 'PK' })
  id: number;

  @Column({ name: 'street', comment: '도로명' })
  street: string;

  @Column({ name: 'city', comment: '도시명' })
  city: string;

  @Column({ name: 'state', comment: '도 명' })
  state: string;

  @Column({ name: 'postal_code', comment: '우편번호' })
  postal_code: string;

  @Column({ name: 'country', comment: '나라명' })
  country: string;
}
