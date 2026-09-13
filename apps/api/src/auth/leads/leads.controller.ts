import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import type { Request } from 'express';

import { SessionGuard } from '../guards/session.guard';
import { JwtPayload } from '../types/jwt-payload.type';

import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { LeadsService } from './leads.service';

// IMPORTANT:
// Replace this import with the SAME JWT guard
// that you already use on /auth/me.
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

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

  @Get()
  findAll(
    @Req()
    request: AuthenticatedRequest,
  ) {
    return this.leadsService.findAll(
      request.user.organizationId,
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