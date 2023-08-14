import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ClosetClothes } from './closet_clothes.entity';
import { UserSetTemperature } from './user_set_temperature.entity';
import { UserSetStyle } from './user_set_style.entity';
import { ClosetType } from './closet_type.entity';
import { ClosetTemperature } from './closet_temperature.entity';

@Entity({ name: 'closet' })
export class Closet extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id', comment: 'PK' })
  id: number;

  @Column({ name: 'name', comment: '의류 이름' })
  name: string;

  //   @Column({ name: 'min_temp', comment: '최저 온도' })
  //   min_temp: string;

  //   @Column({ name: 'max_temp', comment: '최고 온도' })
  //   max_temp: string;

  @Column({ name: 'site_name', comment: '출처' })
  site_name: string;

  @Column({ name: 'site_url', comment: '출처 url' })
  site_url: string;

  @Column({ name: 'image_url', comment: '옷 이미지 url' })
  image_url: string;

  @Column({ name: 'status', comment: '상태' })
  status: string;

  //   @Column({ name: 'is_onboarding', comment: '온보딩 여부' })
  //   is_onboarding: boolean;

  @OneToMany(() => ClosetClothes, (closetClothes) => closetClothes.closet)
  closet_clothes: ClosetClothes[];

  @OneToMany(
    () => UserSetTemperature,
    (userSetTemperature) => userSetTemperature.closet,
  )
  user_pick_closet_id: UserSetTemperature[];

  //   @OneToMany(
  //     () => UserSetTemperature,
  //     (userSetTemperature) => userSetTemperature.minimum_temperature_closet,
  //   )
  //   user_pick_maximum_weather: UserSetTemperature[];

  @OneToMany(() => UserSetStyle, (userSetStyle) => userSetStyle.closet)
  userSetStyles: UserSetStyle[];

  @OneToMany(() => ClosetType, (closetType) => closetType.closet)
  closetTypes: ClosetType[];

  @OneToMany(
    () => ClosetTemperature,
    (closetTemperature) => closetTemperature.closet,
  )
  closetTemperature: ClosetTemperature[];
}
