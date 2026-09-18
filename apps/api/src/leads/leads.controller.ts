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

import type { Request } from 'express';

import { SessionGuard } from '../auth/guards/session.guard';
import { JwtPayload } from '../auth/types/jwt-payload.type';

import { CreateLeadDto } from './dto/create-lead.dto';
import { QueryLeadsDto } from './dto/query-leads.dto';
import { QueryPipelineDto } from './dto/query-pipeline.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { LeadsService } from './leads.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

type AuthenticatedRequest = Request & {
  user: JwtPayload;
};

@Controller('leads')
@UseGuards(
  JwtAuthGuard,
  SessionGuard,
)
export class LeadsController {
  constructor(
    private readonly leadsService: LeadsService,
  ) {}

  @Post()
  create(
    @Req()
    request: AuthenticatedRequest,

    @Body()
    dto: CreateLeadDto,
  ) {
    return this.leadsService.create(
      request.user.organizationId,
      dto,
    );
  }

  /*
   * Static multi-segment routes intentionally live before /:id.
   * They cannot be mistaken for a lead id and let large pages
   * request purpose-built backend data instead of downloading
   * entire lead collections.
   */

  @Get('summary/overview')
  getSummary(
    @Req()
    request: AuthenticatedRequest,
  ) {
    return this.leadsService.getSummary(
      request.user.organizationId,
    );
  }

  @Get('pipeline/board')
  getPipelineBoard(
    @Req()
    request: AuthenticatedRequest,

    @Query()
    query: QueryPipelineDto,
  ): ReturnType<LeadsService['findPipelineBoard']> {
    return this.leadsService.findPipelineBoard(
      request.user.organizationId,
      query,
    );
  }

  @Get()
  findAll(
    @Req()
    request: AuthenticatedRequest,

    @Query()
    query: QueryLeadsDto,
  ) {
    return this.leadsService.findAll(
      request.user.organizationId,
      query,
    );
  }

  @Get(':id')
  findOne(
    @Req()
    request: AuthenticatedRequest,

    @Param('id')
    id: string,
  ) {
    return this.leadsService.findOne(
      request.user.organizationId,
      id,
    );
  }

  @Patch(':id')
  update(
    @Req()
    request: AuthenticatedRequest,

    @Param('id')
    id: string,

    @Body()
    dto: UpdateLeadDto,
  ) {
    return this.leadsService.update(
      request.user.organizationId,
      id,
      dto,
    );
  }

  @Delete(':id')
  remove(
    @Req()
    request: AuthenticatedRequest,

    @Param('id')
    id: string,
  ) {
    return this.leadsService.remove(
      request.user.organizationId,
      id,
    );
  }
}
