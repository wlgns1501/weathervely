import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ClosetClothes } from './closet_clothes.entity';
import { UserPickStyle } from './user_pick_style.entity';
import { UserPickWeather } from './user_pick_weather.entity';

@Entity({ name: 'closet' })
export class Closet extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id', comment: 'PK' })
  id: number;

  @Column({ name: 'name', comment: '의류 이름' })
  name: string;

  @Column({ name: 'min_temp', comment: '최저 온도' })
  min_temp: string;

  @Column({ name: 'max_temp', comment: '최고 온도' })
  max_temp: string;

  @Column('json', { name: 'type', comment: '타입' })
  type: string[];

  @Column({ name: 'site_name', comment: '출처' })
  site_name: string;

  @Column({ name: 'site_url', comment: '출처 url' })
  site_url: string;

  @Column({ name: 'image_url', comment: '옷 이미지 url' })
  image_url: string;

  @Column({ name: 'status', comment: '상태' })
  status: string;

  @OneToMany(() => ClosetClothes, (closetClothes) => closetClothes.closet)
  closet_clothes: ClosetClothes[];

  @OneToMany(
    () => UserPickStyle,
    (userPickStyle) => userPickStyle.user_set_style,
  )
  user_pick_style: UserPickStyle[];

  @OneToMany(
    () => UserPickWeather,
    (userPickWeather) => userPickWeather.maximum_temperature_closet,
  )
  user_pick_minimum_weather: UserPickWeather[];

  @OneToMany(
    () => UserPickWeather,
    (userPickWeather) => userPickWeather.minimum_temperature_closet,
  )
  user_pick_maximum_weather: UserPickWeather[];
}
