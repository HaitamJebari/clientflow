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
  DashboardService,
} from './dashboard.service';

type AuthenticatedRequest =
  Request & {
    user: JwtPayload;
  };

@Controller('dashboard')
@UseGuards(
  JwtAuthGuard,
  SessionGuard,
)
export class DashboardController {
  constructor(
    private readonly dashboardService:
      DashboardService,
  ) {}

  @Get('overview')
  getOverview(
    @Req()
    request:
      AuthenticatedRequest,
  ) {
    return this.dashboardService.getOverview(
      request.user.organizationId,
    );
  }
}
