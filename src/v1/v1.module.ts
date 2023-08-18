import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ClosetModule } from './closet/closet.module';
import { ForecastModule } from './forecast/forecast.module';
import { TypeModule } from './type/type.module';
import { UserModule } from './user/user.module';
import { RouterModule } from '@nestjs/core';

@Module({
  imports: [
    AuthModule,
    ClosetModule,
    ForecastModule,
    TypeModule,
    UserModule,
    RouterModule.register([
      {
        path: 'v1',
        module: AuthModule,
      },
      {
        path: 'v1',
        module: ForecastModule,
      },
      {
        path: 'v1',
        module: ClosetModule,
      },
      {
        path: 'v1',
        module: TypeModule,
      },
      {
        path: 'v1',
        module: UserModule,
      },
    ]),
  ],
})
export class V1Module {}
