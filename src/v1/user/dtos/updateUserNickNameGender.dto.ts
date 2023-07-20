import { PickType } from '@nestjs/swagger';
import { User } from 'src/entities/user.entity';

export class UpdateUserNickNameGenderDto extends PickType(User, [
  'nickname',
  'gender',
]) {}
