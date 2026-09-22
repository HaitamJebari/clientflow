import {
  Controller,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';

import type {
  Request,
} from 'express';

import {
  JwtAuthGuard,
} from '../auth/guards/jwt-auth.guard';

import {
  SessionGuard,
} from '../auth/guards/session.guard';

import type {
  JwtPayload,
} from '../auth/types/jwt-payload.type';

import {
  MembersService,
} from './members.service';

type AuthenticatedRequest =
  Request & {
    user: JwtPayload;
  };

@Controller('members')
@UseGuards(
  JwtAuthGuard,
  SessionGuard,
)
export class MembersController {
  constructor(
    private readonly membersService:
      MembersService,
  ) {}

  @Get()
  findAll(
    @Req()
    request:
      AuthenticatedRequest,
  ) {
    return this.membersService.findAll(
      request.user.organizationId,
      request.user.sub,
    );
  }
}
