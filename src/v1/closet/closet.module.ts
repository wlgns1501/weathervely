import { Module } from '@nestjs/common';
import { ClosetService } from './closet.service';
import { ClosetController } from './closet.controller';
import { AuthRepository } from 'src/repositories/auth.repository';
import { UserAddressRepository } from 'src/repositories/user_address.repository';
import { UserPickStyleRepository } from 'src/repositories/user_pick_style.repository';
import { UserSetTemperatureRepository } from 'src/repositories/user_set_temperature.repository';
import { ClosetRepository } from 'src/repositories/closet.repository';
import { UserSetStyleRepository } from 'src/repositories/user_set_style.repository';
import { CacheModule } from '@nestjs/cache-manager';
import { ForecastService } from '../forecast/forecast.service';
import { TemperatureRangeRepository } from 'src/repositories/temperature_range.repository';
import { UserRepository } from 'src/repositories/user.repository';
import { AddressRepository } from 'src/repositories/address.repository';
@Module({
  imports: [CacheModule.register()],
  providers: [
    ClosetService,
    AuthRepository,
    UserAddressRepository,
    ClosetRepository,
    UserSetStyleRepository,
    UserPickStyleRepository,
    UserSetTemperatureRepository,
    ForecastService,
    TemperatureRangeRepository,
    UserRepository,
    AddressRepository,
  ],
  controllers: [ClosetController],
})
export class ClosetModule {}
