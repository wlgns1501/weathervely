import { Module } from '@nestjs/common';
import { TypeService } from './type.service';
import { TypeController } from './type.controller';
import { TypeRepository } from 'src/repositories/type.repository';

@Module({
  providers: [TypeService, TypeRepository],
  controllers: [TypeController],
})
export class TypeModule {}
