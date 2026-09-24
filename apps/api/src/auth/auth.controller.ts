import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';

import {
  ConfigService,
} from '@nestjs/config';

import type {
  Request,
  Response,
} from 'express';

import {
  AuthService,
} from './auth.service';

import {
  AcceptInvitationLoginDto,
} from './dto/accept-invitation-login.dto';

import {
  AcceptInvitationRegisterDto,
} from './dto/accept-invitation-register.dto';

import {
  LoginDto,
} from './dto/login.dto';

import {
  RegisterDto,
} from './dto/register.dto';

import {
  CurrentUser,
} from './decorators/current-user.decorator';

import {
  JwtAuthGuard,
} from './guards/jwt-auth.guard';

import {
  SessionGuard,
} from './guards/session.guard';

import type {
  JwtPayload,
} from './types/jwt-payload.type';

@Controller('auth')
export class AuthController {
  private readonly refreshTokenExpiresIn:
    number;

  constructor(
    private readonly authService:
      AuthService,

    private readonly configService:
      ConfigService,
  ) {
    this.refreshTokenExpiresIn =
      Number(
        this.configService.get(
          'JWT_REFRESH_EXPIRES_SECONDS',
          '604800',
        ),
      );
  }

  @Post('register')
  async register(
    @Body()
    dto:
      RegisterDto,

    @Req()
    request:
      Request,

    @Res({
      passthrough:
        true,
    })
    response:
      Response,
  ) {
    const result =
      await this.authService.register(
        dto,
        request.get(
          'user-agent',
        ),
      );

    this.setRefreshTokenCookie(
      response,
      result.refreshToken,
    );

    return {
      user:
        result.user,

      organization:
        result.organization,

      accessToken:
        result.accessToken,
    };
  }

  @Post('login')
  @HttpCode(
    HttpStatus.OK,
  )
  async login(
    @Body()
    dto:
      LoginDto,

    @Req()
    request:
      Request,

    @Res({
      passthrough:
        true,
    })
    response:
      Response,
  ) {
    const result =
      await this.authService.login(
        dto,
        request.get(
          'user-agent',
        ),
      );

    this.setRefreshTokenCookie(
      response,
      result.refreshToken,
    );

    return {
      user:
        result.user,

      organization:
        result.organization,

      accessToken:
        result.accessToken,
    };
  }

  @Post('refresh')
  @HttpCode(
    HttpStatus.OK,
  )
  async refresh(
    @Req()
    request:
      Request,

    @Res({
      passthrough:
        true,
    })
    response:
      Response,
  ) {
    const refreshToken =
      request.cookies
        ?.refresh_token as
        | string
        | undefined;

    if (
      !refreshToken
    ) {
      throw new UnauthorizedException(
        'Refresh token is missing.',
      );
    }

    const result =
      await this.authService.refresh(
        refreshToken,
      );

    this.setRefreshTokenCookie(
      response,
      result.refreshToken,
    );

    return {
      accessToken:
        result.accessToken,
    };
  }

  @Post('logout')
  @HttpCode(
    HttpStatus.NO_CONTENT,
  )
  @UseGuards(
    JwtAuthGuard,
    SessionGuard,
  )
  async logout(
    @CurrentUser()
    currentUser:
      JwtPayload,

    @Res({
      passthrough:
        true,
    })
    response:
      Response,
  ): Promise<void> {
    await this.authService.logout(
      currentUser.sessionId,
    );

    this.clearRefreshTokenCookie(
      response,
    );
  }

  @Get('me')
  @UseGuards(
    JwtAuthGuard,
    SessionGuard,
  )
  async getMe(
    @CurrentUser()
    currentUser:
      JwtPayload,
  ) {
    return this.authService.getMe(
      currentUser.sub,
      currentUser.organizationId,
    );
  }

  @Get('invitations/:token')
  getInvitationPreview(
    @Param('token')
    token:
      string,
  ) {
    return this.authService.getInvitationPreview(
      token,
    );
  }

  @Post('invitations/:token/register')
  async registerWithInvitation(
    @Param('token')
    token:
      string,

    @Body()
    dto:
      AcceptInvitationRegisterDto,

    @Req()
    request:
      Request,

    @Res({
      passthrough:
        true,
    })
    response:
      Response,
  ) {
    const result =
      await this.authService.registerWithInvitation(
        token,
        dto,
        request.get(
          'user-agent',
        ),
      );

    this.setRefreshTokenCookie(
      response,
      result.refreshToken,
    );

    return {
      user:
        result.user,

      organization:
        result.organization,

      accessToken:
        result.accessToken,
    };
  }

  @Post('invitations/:token/login')
  @HttpCode(
    HttpStatus.OK,
  )
  async loginWithInvitation(
    @Param('token')
    token:
      string,

    @Body()
    dto:
      AcceptInvitationLoginDto,

    @Req()
    request:
      Request,

    @Res({
      passthrough:
        true,
    })
    response:
      Response,
  ) {
    const result =
      await this.authService.loginWithInvitation(
        token,
        dto,
        request.get(
          'user-agent',
        ),
      );

    this.setRefreshTokenCookie(
      response,
      result.refreshToken,
    );

    return {
      user:
        result.user,

      organization:
        result.organization,

      accessToken:
        result.accessToken,
    };
  }

  @Post('invitations/:token/accept')
  @HttpCode(
    HttpStatus.OK,
  )
  @UseGuards(
    JwtAuthGuard,
    SessionGuard,
  )
  async acceptInvitation(
    @Param('token')
    token:
      string,

    @CurrentUser()
    currentUser:
      JwtPayload,

    @Req()
    request:
      Request,

    @Res({
      passthrough:
        true,
    })
    response:
      Response,
  ) {
    const result =
      await this.authService.acceptInvitation(
        token,
        currentUser.sub,
        currentUser.sessionId,
        request.get(
          'user-agent',
        ),
      );

    this.setRefreshTokenCookie(
      response,
      result.refreshToken,
    );

    return {
      user:
        result.user,

      organization:
        result.organization,

      accessToken:
        result.accessToken,
    };
  }

  @Get('workspaces')
  @UseGuards(
    JwtAuthGuard,
    SessionGuard,
  )
  listWorkspaces(
    @CurrentUser()
    currentUser:
      JwtPayload,
  ) {
    return this.authService.listWorkspaces(
      currentUser.sub,
      currentUser.organizationId,
    );
  }

  @Post('workspaces/:organizationId/switch')
  @HttpCode(
    HttpStatus.OK,
  )
  @UseGuards(
    JwtAuthGuard,
    SessionGuard,
  )
  async switchWorkspace(
    @Param('organizationId')
    organizationId:
      string,

    @CurrentUser()
    currentUser:
      JwtPayload,

    @Req()
    request:
      Request,

    @Res({
      passthrough:
        true,
    })
    response:
      Response,
  ) {
    const result =
      await this.authService.switchWorkspace(
        currentUser.sub,
        currentUser.sessionId,
        organizationId,
        request.get(
          'user-agent',
        ),
      );

    this.setRefreshTokenCookie(
      response,
      result.refreshToken,
    );

    return {
      user:
        result.user,

      organization:
        result.organization,

      accessToken:
        result.accessToken,
    };
  }

  private setRefreshTokenCookie(
    response:
      Response,

    refreshToken:
      string,
  ): void {
    const isProduction =
      process.env.NODE_ENV ===
      'production';

    response.cookie(
      'refresh_token',
      refreshToken,
      {
        httpOnly:
          true,

        secure:
          isProduction,

        sameSite:
          isProduction
            ? 'none'
            : 'lax',

        path:
          '/api/v1/auth',

        maxAge:
          this.refreshTokenExpiresIn *
          1000,
      },
    );
  }

  private clearRefreshTokenCookie(
    response:
      Response,
  ): void {
    const isProduction =
      process.env.NODE_ENV ===
      'production';

    response.clearCookie(
      'refresh_token',
      {
        httpOnly:
          true,

        secure:
          isProduction,

        sameSite:
          isProduction
            ? 'none'
            : 'lax',

        path:
          '/api/v1/auth',
      },
    );
  }
}
