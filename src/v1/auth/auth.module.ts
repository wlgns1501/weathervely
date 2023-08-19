import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthRepository } from 'src/repositories/auth.repository';
import { AddressRepository } from 'src/repositories/address.repository';
import { UserAddressRepository } from 'src/repositories/user_address.repository';
import { UserSetTemperatureRepository } from 'src/repositories/user_set_temperature.repository';

@Module({
  providers: [
    AuthService,
    AuthRepository,
    AddressRepository,
    UserAddressRepository,
    UserSetTemperatureRepository,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
