import {
  Body,
  Controller,
  Get,
  Patch,
  UseGuards,
} from '@nestjs/common';

import {
  OrganizationRole,
} from '../generated/prisma/client.js';

import { OrganizationsService } from './organizations.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { OrganizationMembershipGuard } from '../auth/guards/organization-membership.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';

import type { JwtPayload } from '../auth/types/jwt-payload.type';

import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Controller('organizations')
@UseGuards(
  JwtAuthGuard,
  SessionGuard,
  OrganizationMembershipGuard,
  RolesGuard,
)
export class OrganizationsController {
  constructor(
    private readonly organizationsService:
      OrganizationsService,
  ) {}

  @Get('current')
  getCurrent(
    @CurrentUser()
    currentUser: JwtPayload,
  ) {
    return this.organizationsService.getCurrent(
      currentUser.sub,
      currentUser.organizationId,
    );
  }

  @Patch('current')
  @Roles(
    OrganizationRole.OWNER,
    OrganizationRole.ADMIN,
  )
  updateCurrent(
    @CurrentUser()
    currentUser: JwtPayload,

    @Body()
    dto: UpdateOrganizationDto,
  ) {
    return this.organizationsService.updateCurrent(
      currentUser.organizationId,
      dto,
    );
  }
}