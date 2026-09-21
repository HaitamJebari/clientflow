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
  InsightsService,
} from './insights.service';

type AuthenticatedRequest =
  Request & {
    user: JwtPayload;
  };

@Controller('insights')
@UseGuards(
  JwtAuthGuard,
  SessionGuard,
)
export class InsightsController {
  constructor(
    private readonly insightsService:
      InsightsService,
  ) {}

  @Get('overview')
  getOverview(
    @Req()
    request:
      AuthenticatedRequest,
  ) {
    return this.insightsService.getOverview(
      request.user.organizationId,
    );
  }
}
