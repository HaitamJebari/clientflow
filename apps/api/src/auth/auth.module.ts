import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

import { AccessTokenStrategy } from './strategies/access-token.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

import { SessionGuard } from './guards/session.guard';

import { OrganizationMembershipGuard } from './guards/organization-membership.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt',
      session: false,
    }),

    JwtModule.register({}),
  ],

  controllers: [AuthController],

  providers: [
    AuthService,
    AccessTokenStrategy,
    JwtAuthGuard,
    SessionGuard,
    OrganizationMembershipGuard,
    RolesGuard,
  ],

  exports: [
    AuthService,
    JwtAuthGuard,
    SessionGuard,
    OrganizationMembershipGuard,
    RolesGuard,
  ],
})
export class AuthModule {}
