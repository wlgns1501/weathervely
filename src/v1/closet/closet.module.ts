import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Address } from 'src/entities/address.entity';
import { ClosetController } from './closet.controller';
import { ClosetService } from './closet.service';
import { ClosetRepository } from 'src/repositories/closet.repository';
import { UserPickStyleRepository } from 'src/repositories/user_pick_style.repository';
import { AuthRepository } from 'src/repositories/auth.repository';
import { UserAddressRepository } from 'src/repositories/user_address.repository';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  // imports: [TypeOrmModule.forFeature([User, Address])],
  imports: [CacheModule.register()],
  controllers: [ClosetController],
  providers: [
    ClosetService,
    ClosetRepository,
    UserPickStyleRepository,
    AuthRepository,
    UserAddressRepository,
  ],
})
export class ClosetModule {}
