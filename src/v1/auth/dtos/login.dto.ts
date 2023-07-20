import { PickType } from '@nestjs/swagger';
import { User } from 'src/entities/user.entity';

export class LoginDto extends PickType(User, ['nickname']) {}
