import { Module } from '@nestjs/common';
import { ClosetService } from './closet.service';
import { ClosetController } from './closet.controller';
import { AuthRepository } from 'src/repositories/auth.repository';
import { UserAddressRepository } from 'src/repositories/user_address.repository';
import { ClosetRepository } from 'src/repositories/closet.repository';
import { UserSetStyleRepository } from 'src/repositories/user_set_style.repository';

@Module({
  providers: [
    ClosetService,
    AuthRepository,
    UserAddressRepository,
    ClosetRepository,
    UserSetStyleRepository,
  ],
  controllers: [ClosetController],
})
export class ClosetModule {}
