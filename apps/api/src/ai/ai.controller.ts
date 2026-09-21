import {
  Body,
  Controller,
  Post,
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
  AiService,
} from './ai.service';

import {
  GenerateFollowUpDto,
} from './dto/generate-follow-up.dto';

import {
  GenerateInsightDto,
} from './dto/generate-insight.dto';

type AuthenticatedRequest =
  Request & {
    user: JwtPayload;
  };

@Controller('ai')
@UseGuards(
  JwtAuthGuard,
  SessionGuard,
)
export class AiController {
  constructor(
    private readonly aiService:
      AiService,
  ) {}

  @Post('follow-up')
  generateFollowUp(
    @Req()
    request:
      AuthenticatedRequest,

    @Body()
    dto:
      GenerateFollowUpDto,
  ) {
    return this.aiService.generateFollowUp(
      request.user.organizationId,
      dto,
    );
  }

  @Post('insight')
  generateInsight(
    @Req()
    request:
      AuthenticatedRequest,

    @Body()
    dto:
      GenerateInsightDto,
  ) {
    return this.aiService.generateInsight(
      request.user.organizationId,
      dto.leadId,
    );
  }
}
