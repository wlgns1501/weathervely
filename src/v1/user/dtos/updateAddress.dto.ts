import { PickType } from '@nestjs/swagger';
import { Address } from 'src/entities/address.entity';

export class UpdateAddressDto extends PickType(Address, [
  'address_name',
  'country',
  'city',
  'gu',
  'dong',
  'postal_code',
  'x_code',
  'y_code',
]) {}
