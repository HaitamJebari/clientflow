import {
  Controller,
  Get,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import type {
  Request,
} from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { JwtPayload } from '../auth/types/jwt-payload.type';

import { ContactsService } from './contacts.service';
import { QueryContactsDto } from '../leads/dto/query-contacts.dto';

type AuthenticatedRequest =
  Request & {
    user: JwtPayload;
  };

@Controller('contacts')
@UseGuards(
  JwtAuthGuard,
  SessionGuard,
)
export class ContactsController {
  constructor(
    private readonly contactsService:
      ContactsService,
  ) {}

  @Get('summary/overview')
  getSummary(
    @Req()
    request:
      AuthenticatedRequest,
  ) {
    return this.contactsService.getSummary(
      request.user.organizationId,
    );
  }

  @Get()
  findAll(
    @Req()
    request:
      AuthenticatedRequest,

    @Query()
    query:
      QueryContactsDto,
  ) {
    return this.contactsService.findAll(
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
    return this.contactsService.findOne(
      request.user.organizationId,
      id,
    );
  }
}
