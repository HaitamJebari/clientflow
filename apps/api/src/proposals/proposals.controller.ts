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
  CreateProposalDto,
} from './dto/create-proposal.dto';

import {
  QueryProposalLeadOptionsDto,
} from './dto/query-proposal-lead-options.dto';

import {
  QueryProposalsDto,
} from './dto/query-proposals.dto';

import {
  UpdateProposalDto,
} from './dto/update-proposal.dto';

import {
  ProposalsService,
} from './proposals.service';

type AuthenticatedRequest =
  Request & {
    user: JwtPayload;
  };

@Controller('proposals')
@UseGuards(
  JwtAuthGuard,
  SessionGuard,
)
export class ProposalsController {
  constructor(
    private readonly proposalsService:
      ProposalsService,
  ) {}

  @Get('options/leads')
  findLeadOptions(
    @Req()
    request:
      AuthenticatedRequest,

    @Query()
    query:
      QueryProposalLeadOptionsDto,
  ) {
    return this.proposalsService.findLeadOptions(
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
      CreateProposalDto,
  ) {
    return this.proposalsService.create(
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
      QueryProposalsDto,
  ) {
    return this.proposalsService.findAll(
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
    return this.proposalsService.findOne(
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
      UpdateProposalDto,
  ) {
    return this.proposalsService.update(
      request.user.organizationId,
      id,
      dto,
    );
  }

  @Post(':id/mark-sent')
  markSent(
    @Req()
    request:
      AuthenticatedRequest,

    @Param('id')
    id: string,
  ) {
    return this.proposalsService.markSent(
      request.user.organizationId,
      id,
    );
  }

  @Post(':id/record-view')
  recordView(
    @Req()
    request:
      AuthenticatedRequest,

    @Param('id')
    id: string,
  ) {
    return this.proposalsService.recordView(
      request.user.organizationId,
      id,
    );
  }

  @Post(':id/accept')
  accept(
    @Req()
    request:
      AuthenticatedRequest,

    @Param('id')
    id: string,
  ) {
    return this.proposalsService.accept(
      request.user.organizationId,
      id,
    );
  }

  @Post(':id/reject')
  reject(
    @Req()
    request:
      AuthenticatedRequest,

    @Param('id')
    id: string,
  ) {
    return this.proposalsService.reject(
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
    return this.proposalsService.remove(
      request.user.organizationId,
      id,
    );
  }
}
