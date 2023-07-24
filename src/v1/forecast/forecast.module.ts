import { Module } from '@nestjs/common';
import { ForecastController } from './forecast.controller';
import { ForecastService } from './forecast.service';
import { CacheModule } from '@nestjs/cache-manager';
import { AuthRepository } from 'src/repositories/auth.repository';
import { UserAddressRepository } from 'src/repositories/user_address.repository';

@Module({
  imports: [CacheModule.register()],
  controllers: [ForecastController],
  providers: [ForecastService, AuthRepository, UserAddressRepository],
})
export class ForecastModule {}
