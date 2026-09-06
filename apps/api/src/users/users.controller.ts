import {
  Body,
  Controller,
  Get,
  Patch,
  UseGuards,
} from '@nestjs/common';

import { UsersService } from './users.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SessionGuard } from '../auth/guards/session.guard';

import { CurrentUser } from '../auth/decorators/current-user.decorator';

import * as jwtPayloadType from '../auth/types/jwt-payload.type';

import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
@UseGuards(
  JwtAuthGuard,
  SessionGuard,
)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  @Get('me')
  getMe(
    @CurrentUser()
    currentUser: jwtPayloadType.JwtPayload,
  ) {
    return this.usersService.getMe(
      currentUser.sub,
    );
  }

  @Patch('me')
  updateMe(
    @CurrentUser()
    currentUser: jwtPayloadType.JwtPayload,

    @Body()
    dto: UpdateUserDto,
  ) {
    return this.usersService.updateMe(
      currentUser.sub,
      dto,
    );
  }
}