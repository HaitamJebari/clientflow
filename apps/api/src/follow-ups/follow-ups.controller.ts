import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
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
  CreateFollowUpDto,
} from './dto/create-follow-up.dto';

import {
  QueryFollowUpLeadOptionsDto,
} from './dto/query-follow-up-lead-options.dto';

import {
  QueryFollowUpsDto,
} from './dto/query-follow-ups.dto';

import {
  UpdateFollowUpDto,
} from './dto/update-follow-up.dto';

import {
  FollowUpsService,
} from './follow-ups.service';

type AuthenticatedRequest =
  Request & {
    user: JwtPayload;
  };

@Controller('follow-ups')
@UseGuards(
  JwtAuthGuard,
  SessionGuard,
)
export class FollowUpsController {
  constructor(
    private readonly followUpsService:
      FollowUpsService,
  ) {}

  @Get('summary/overview')
  getSummary(
    @Req()
    request:
      AuthenticatedRequest,
  ) {
    return this.followUpsService.getSummary(
      request.user.organizationId,
    );
  }

  @Get('options/leads')
  findLeadOptions(
    @Req()
    request:
      AuthenticatedRequest,

    @Query()
    query:
      QueryFollowUpLeadOptionsDto,
  ) {
    return this.followUpsService.findLeadOptions(
      request.user.organizationId,
      query,
    );
  }

  @Post()
  create(
    @Req()
    request:
      AuthenticatedRequest,

    @Body()
    dto:
      CreateFollowUpDto,
  ) {
    return this.followUpsService.create(
      request.user.organizationId,
      dto,
    );
  }

  @Get()
  findAll(
    @Req()
    request:
      AuthenticatedRequest,

    @Query()
    query:
      QueryFollowUpsDto,
  ) {
    return this.followUpsService.findAll(
      request.user.organizationId,
      query,
    );
  }

  @Get(':id')
  findOne(
    @Req()
    request:
      AuthenticatedRequest,

    @Param('id')
    id: string,
  ) {
    return this.followUpsService.findOne(
      request.user.organizationId,
      id,
    );
  }

  @Patch(':id')
  update(
    @Req()
    request:
      AuthenticatedRequest,

    @Param('id')
    id: string,

    @Body()
    dto:
      UpdateFollowUpDto,
  ) {
    return this.followUpsService.update(
      request.user.organizationId,
      id,
      dto,
    );
  }

  @Post(':id/complete')
  complete(
    @Req()
    request:
      AuthenticatedRequest,

    @Param('id')
    id: string,
  ) {
    return this.followUpsService.complete(
      request.user.organizationId,
      id,
    );
  }

  @Post(':id/cancel')
  cancel(
    @Req()
    request:
      AuthenticatedRequest,

    @Param('id')
    id: string,
  ) {
    return this.followUpsService.cancel(
      request.user.organizationId,
      id,
    );
  }

  @Delete(':id')
  remove(
    @Req()
    request:
      AuthenticatedRequest,

    @Param('id')
    id: string,
  ) {
    return this.followUpsService.remove(
      request.user.organizationId,
      id,
    );
  }
}
