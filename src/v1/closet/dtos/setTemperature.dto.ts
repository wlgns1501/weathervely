import { ApiProperty } from '@nestjs/swagger';
import { PickType } from '@nestjs/swagger';
import { UserPickWeather } from 'src/entities/user_pick_weather.entity';

export class SetTemperatureDto extends PickType(UserPickWeather, [
  'closet',
  'temperature',
]) {}
