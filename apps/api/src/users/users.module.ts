import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';

import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,

    PassportModule.register({
      defaultStrategy: 'jwt',
      session: false,
    }),
  ],

  controllers: [
    UsersController,
  ],

  providers: [
    UsersService,
  ],

  exports: [
    UsersService,
  ],
})
export class UsersModule {}