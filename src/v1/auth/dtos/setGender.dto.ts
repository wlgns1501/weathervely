import { PickType } from '@nestjs/swagger';
import { User } from 'src/entities/user.entity';

export class SetGenderDto extends PickType(User, ['gender']) {}
