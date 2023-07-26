import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AddressRepository } from 'src/repositories/address.repository';
import { AuthRepository } from 'src/repositories/auth.repository';
import { UserAddressRepository } from 'src/repositories/user_address.repository';
import { UserRepository } from 'src/repositories/user.repository';

@Module({
  controllers: [UserController],
  providers: [
    UserService,
    AuthRepository,
    AddressRepository,
    UserAddressRepository,
    UserRepository,
  ],
})
export class UserModule {}