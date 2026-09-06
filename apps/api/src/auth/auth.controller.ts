import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import type {
  Request,
  Response,
} from 'express';

import { AuthService } from './auth.service';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

import { JwtAuthGuard } from './guards/jwt-auth.guard';

import { CurrentUser } from './decorators/current-user.decorator';

import * as jwtPayloadType from './types/jwt-payload.type';

@Controller('auth')
export class AuthController {
  private readonly refreshTokenExpiresIn: number;

  constructor(
    private readonly authService: AuthService,

    private readonly configService: ConfigService,
  ) {
    this.refreshTokenExpiresIn = Number(
      this.configService.get(
        'JWT_REFRESH_EXPIRES_SECONDS',
        '604800',
      ),
    );
  }

  @Post('register')
  async register(
    @Body() dto: RegisterDto,

    @Req() request: Request,

    @Res({
      passthrough: true,
    })
    response: Response,
  ) {
    const result =
      await this.authService.register(
        dto,
        request.get('user-agent'),
      );

    this.setRefreshTokenCookie(
      response,
      result.refreshToken,
    );

    return {
      user: result.user,
      organization:
        result.organization,
      accessToken:
        result.accessToken,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,

    @Req() request: Request,

    @Res({
      passthrough: true,
    })
    response: Response,
  ) {
    const result =
      await this.authService.login(
        dto,
        request.get('user-agent'),
      );

    this.setRefreshTokenCookie(
      response,
      result.refreshToken,
    );

    return {
      user: result.user,
      organization:
        result.organization,
      accessToken:
        result.accessToken,
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() request: Request,

    @Res({
      passthrough: true,
    })
    response: Response,
  ) {
    // console.log('RAW COOKIE HEADER:', request.headers.cookie);
    // console.log('PARSED COOKIES:', request.cookies);
    const refreshToken =
      request.cookies?.refresh_token as
        | string
        | undefined;

    if (!refreshToken) {
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
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async logout(
    @CurrentUser()
    currentUser: jwtPayloadType.JwtPayload,

    @Res({
      passthrough: true,
    })
    response: Response,
  ): Promise<void> {
    await this.authService.logout(
      currentUser.sessionId,
    );

    this.clearRefreshTokenCookie(
      response,
    );
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(
    @CurrentUser()
    currentUser: jwtPayloadType.JwtPayload,
  ) {
    return this.authService.getMe(
      currentUser.sub,
      currentUser.organizationId,
    );
  }

  private setRefreshTokenCookie(
    response: Response,
    refreshToken: string,
  ): void {
    response.cookie(
      'refresh_token',
      refreshToken,
      {
        httpOnly: true,

        secure:
          process.env.NODE_ENV ===
          'production',

        sameSite: 'lax',

        path: '/api/v1/auth',

        maxAge:
          this.refreshTokenExpiresIn *
          1000,
      },
    );
  }

  private clearRefreshTokenCookie(
    response: Response,
  ): void {
    response.clearCookie(
      'refresh_token',
      {
        httpOnly: true,

        secure:
          process.env.NODE_ENV ===
          'production',

        sameSite: 'lax',

        path: '/api/v1/auth',
      },
    );
  }
}