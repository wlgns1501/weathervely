import { PickType } from '@nestjs/swagger';
import { Address } from 'src/entities/address.entity';

export class SetAddressDto extends PickType(Address, [
  'address_name',
  'country',
  'city',
  'gu',
  'dong',
  'x_code',
  'y_code',
]) {}
