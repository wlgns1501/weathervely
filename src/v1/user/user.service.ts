import { Injectable } from '@nestjs/common';
import { User } from 'src/entities/user.entity';

@Injectable()
export class UserService {
  //   constructor(private readonly userRepository: UserRepository) {}

  async getUserNickNameGender(user: User) {}
}
