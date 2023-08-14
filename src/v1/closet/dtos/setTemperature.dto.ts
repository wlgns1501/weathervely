import { ApiProperty } from '@nestjs/swagger';
import { PickType } from '@nestjs/swagger';
import { UserSetTemperature } from 'src/entities/user_set_temperature.entity';

export class SetTemperatureDto extends PickType(UserSetTemperature, [
  'closet',
  'current_temperature',
]) {}
