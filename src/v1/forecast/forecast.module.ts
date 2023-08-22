import { Module } from '@nestjs/common';
import { ForecastController } from './forecast.controller';
import { ForecastService } from './forecast.service';
import { CacheModule } from '@nestjs/cache-manager';
import { AuthRepository } from 'src/repositories/auth.repository';
import { UserAddressRepository } from 'src/repositories/user_address.repository';
import { UserSetTemperatureRepository } from 'src/repositories/user_set_temperature.repository';
import { UserRepository } from 'src/repositories/user.repository';
import { AddressRepository } from 'src/repositories/address.repository';

@Module({
  imports: [CacheModule.register()],
  controllers: [ForecastController],
  providers: [
    ForecastService,
    AuthRepository,
    UserAddressRepository,
    UserSetTemperatureRepository,
    UserRepository,
    AddressRepository,
  ],
})
export class ForecastModule {}
