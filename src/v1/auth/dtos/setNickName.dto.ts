import { PickType } from '@nestjs/swagger';
import { User } from 'src/entities/user.entity';

export class SetNickNameDto extends PickType(User, ['nickname']) {}
