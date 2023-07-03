import { PickType } from '@nestjs/swagger';
import { User } from 'src/entities/user.entity';

export class CreateNickNameDto extends PickType(User, ['nickname']) {}
