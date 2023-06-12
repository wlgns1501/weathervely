import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'user' })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id', comment: 'PK' })
  id: number;

  @Column({ name: 'nickname', comment: '닉네임', length: 5, unique: true })
  nickname: string;

  @Column({ name: 'token', comment: 'token' })
  token: string;

  @CreateDateColumn({ name: 'createdAt', comment: '생성 시간' })
  createdAt: Date;
}
