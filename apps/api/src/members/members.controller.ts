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
  CreateMemberInvitationDto,
} from './dto/create-member-invitation.dto';

import {
  UpdateMemberRoleDto,
} from './dto/update-member-role.dto';

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

  @Get('invitations')
  findInvitations(
    @Req()
    request:
      AuthenticatedRequest,
  ) {
    return this.membersService.findInvitations(
      request.user.organizationId,
      request.user.sub,
    );
  }

  @Post('invitations')
  createInvitation(
    @Req()
    request:
      AuthenticatedRequest,

    @Body()
    dto:
      CreateMemberInvitationDto,
  ) {
    return this.membersService.createInvitation(
      request.user.organizationId,
      request.user.sub,
      dto,
    );
  }

  @Delete('invitations/:invitationId')
  revokeInvitation(
    @Req()
    request:
      AuthenticatedRequest,

    @Param('invitationId')
    invitationId:
      string,
  ) {
    return this.membersService.revokeInvitation(
      request.user.organizationId,
      request.user.sub,
      invitationId,
    );
  }

  @Patch(':memberId/role')
  updateRole(
    @Req()
    request:
      AuthenticatedRequest,

    @Param('memberId')
    memberId:
      string,

    @Body()
    dto:
      UpdateMemberRoleDto,
  ) {
    return this.membersService.updateRole(
      request.user.organizationId,
      request.user.sub,
      memberId,
      dto,
    );
  }

  @Delete(':memberId')
  removeMember(
    @Req()
    request:
      AuthenticatedRequest,

    @Param('memberId')
    memberId:
      string,
  ) {
    return this.membersService.removeMember(
      request.user.organizationId,
      request.user.sub,
      memberId,
    );
  }
}
