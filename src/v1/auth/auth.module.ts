import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthRepository } from 'src/repositories/auth.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Address } from 'src/entities/address.entity';
import { AddressRepository } from 'src/repositories/address.repository';
import { UserAddressRepository } from 'src/repositories/user_address.repository';

@Module({
  imports: [TypeOrmModule.forFeature([User, Address])],
  providers: [
    AuthService,
    AuthRepository,
    AddressRepository,
    UserAddressRepository,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
