import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import * as argon2 from 'argon2';

import {
  randomBytes,
  randomUUID,
} from 'crypto';

import { PrismaService } from '../prisma/prisma.service';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

import { JwtPayload } from './types/jwt-payload.type';

@Injectable()
export class AuthService {
  private readonly accessTokenExpiresIn: number;
  private readonly refreshTokenExpiresIn: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.accessTokenExpiresIn = Number(
      this.configService.get(
        'JWT_ACCESS_EXPIRES_SECONDS',
        '900',
      ),
    );

    this.refreshTokenExpiresIn = Number(
      this.configService.get(
        'JWT_REFRESH_EXPIRES_SECONDS',
        '604800',
      ),
    );
  }

  async register(
    dto: RegisterDto,
    userAgent?: string,
  ) {
    const email = dto.email.trim().toLowerCase();

    const existingUser =
      await this.prisma.user.findUnique({
        where: {
          email,
        },
      });

    if (existingUser) {
      throw new ConflictException(
        'An account with this email already exists.',
      );
    }

    const passwordHash = await argon2.hash(
      dto.password,
      {
        type: argon2.argon2id,
      },
    );

    const userId = randomUUID();
    const organizationId = randomUUID();
    const sessionId = randomUUID();

    const organizationSlug =
      this.generateOrganizationSlug(
        dto.businessName,
      );

    const tokens = await this.generateTokens({
      userId,
      organizationId,
      sessionId,
    });

    const refreshTokenHash =
      await argon2.hash(tokens.refreshToken, {
        type: argon2.argon2id,
      });

    const sessionExpiresAt =
      this.getRefreshTokenExpirationDate();

    const result =
      await this.prisma.$transaction(
        async (transaction) => {
          const user =
            await transaction.user.create({
              data: {
                id: userId,
                email,
                passwordHash,

                firstName:
                  dto.firstName?.trim() || null,

                lastName:
                  dto.lastName?.trim() || null,
              },

              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                emailVerified: true,
                createdAt: true,
              },
            });

          const organization =
            await transaction.organization.create(
              {
                data: {
                  id: organizationId,
                  name: dto.businessName.trim(),
                  slug: organizationSlug,
                },

                select: {
                  id: true,
                  name: true,
                  slug: true,
                  createdAt: true,
                },
              },
            );

          await transaction.organizationMember.create(
            {
              data: {
                userId,
                organizationId,
                role: 'OWNER',
              },
            },
          );

          await transaction.session.create({
            data: {
              id: sessionId,

              userId,
              organizationId,

              refreshTokenHash,

              expiresAt:
                sessionExpiresAt,

              userAgent:
                userAgent || null,
            },
          });

          return {
            user,
            organization,
          };
        },
      );

    return {
      ...result,

      accessToken:
        tokens.accessToken,

      refreshToken:
        tokens.refreshToken,
    };
  }

  async login(
    dto: LoginDto,
    userAgent?: string,
  ) {
    const email = dto.email.trim().toLowerCase();

    const user =
      await this.prisma.user.findUnique({
        where: {
          email,
        },

        include: {
          memberships: {
            include: {
              organization: true,
            },

            orderBy: {
              createdAt: 'asc',
            },

            take: 1,
          },
        },
      });

    if (!user) {
      throw new UnauthorizedException(
        'Invalid email or password.',
      );
    }

    const passwordMatches =
      await argon2.verify(
        user.passwordHash,
        dto.password,
      );

    if (!passwordMatches) {
      throw new UnauthorizedException(
        'Invalid email or password.',
      );
    }

    const membership =
      user.memberships[0];

    if (!membership) {
      throw new UnauthorizedException(
        'No organization is associated with this account.',
      );
    }

    const sessionId = randomUUID();

    const tokens = await this.generateTokens({
      userId: user.id,

      organizationId:
        membership.organizationId,

      sessionId,
    });

    const refreshTokenHash =
      await argon2.hash(
        tokens.refreshToken,
        {
          type: argon2.argon2id,
        },
      );

    await this.prisma.session.create({
      data: {
        id: sessionId,

        userId: user.id,

        organizationId:
          membership.organizationId,

        refreshTokenHash,

        expiresAt:
          this.getRefreshTokenExpirationDate(),

        userAgent:
          userAgent || null,
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        emailVerified:
          user.emailVerified,
      },

      organization: {
        id: membership.organization.id,
        name: membership.organization.name,
        slug: membership.organization.slug,
        role: membership.role,
      },

      accessToken:
        tokens.accessToken,

      refreshToken:
        tokens.refreshToken,
    };
  }

  async refresh(
    refreshToken: string,
  ) {
    let payload: JwtPayload;

    try {
      payload =
        await this.jwtService.verifyAsync<JwtPayload>(
          refreshToken,
          {
            secret:
              this.configService.getOrThrow<string>(
                'JWT_REFRESH_SECRET',
              ),
          },
        );
    } catch {
      throw new UnauthorizedException(
        'Invalid or expired refresh token.',
      );
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException(
        'Invalid refresh token.',
      );
    }

    const session =
      await this.prisma.session.findUnique({
        where: {
          id: payload.sessionId,
        },
      });

    if (
      !session ||
      session.revokedAt ||
      session.expiresAt <= new Date()
    ) {
      throw new UnauthorizedException(
        'Session has expired.',
      );
    }

    if (
      session.userId !== payload.sub ||
      session.organizationId !==
        payload.organizationId
    ) {
      throw new UnauthorizedException(
        'Invalid session.',
      );
    }

    const tokenMatches =
      await argon2.verify(
        session.refreshTokenHash,
        refreshToken,
      );

    if (!tokenMatches) {
      /*
       * Someone attempted to use a refresh
       * token that does not match the latest
       * token stored for this session.
       *
       * Revoke the session.
       */
      await this.prisma.session.update({
        where: {
          id: session.id,
        },

        data: {
          revokedAt: new Date(),
        },
      });

      throw new UnauthorizedException(
        'Refresh token reuse detected.',
      );
    }

    const tokens = await this.generateTokens({
      userId: session.userId,
      organizationId:
        session.organizationId,
      sessionId: session.id,
    });

    const refreshTokenHash =
      await argon2.hash(
        tokens.refreshToken,
        {
          type: argon2.argon2id,
        },
      );

    await this.prisma.session.update({
      where: {
        id: session.id,
      },

      data: {
        refreshTokenHash,

        expiresAt:
          this.getRefreshTokenExpirationDate(),
      },
    });

    return {
      accessToken:
        tokens.accessToken,

      refreshToken:
        tokens.refreshToken,
    };
  }

  async logout(
    sessionId: string,
  ): Promise<void> {
    await this.prisma.session.updateMany({
      where: {
        id: sessionId,

        revokedAt: null,
      },

      data: {
        revokedAt: new Date(),
      },
    });
  }

  async getMe(
    userId: string,
    organizationId: string,
  ) {
    const membership =
      await this.prisma.organizationMember.findFirst(
        {
          where: {
            userId,
            organizationId,
          },

          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
                emailVerified: true,
                createdAt: true,
              },
            },

            organization: {
              select: {
                id: true,
                name: true,
                slug: true,
                website: true,
                industry: true,
                createdAt: true,
              },
            },
          },
        },
      );

    if (!membership) {
      throw new UnauthorizedException(
        'Organization membership not found.',
      );
    }

    return {
      user: membership.user,

      organization: {
        ...membership.organization,

        role: membership.role,
      },
    };
  }

  private async generateTokens({
    userId,
    organizationId,
    sessionId,
  }: {
    userId: string;
    organizationId: string;
    sessionId: string;
  }) {
    const accessPayload: JwtPayload = {
      sub: userId,
      organizationId,
      sessionId,
      type: 'access',
    };

    const refreshPayload: JwtPayload = {
      sub: userId,
      organizationId,
      sessionId,
      type: 'refresh',
    };

    const accessSecret =
      this.configService.getOrThrow<string>(
        'JWT_ACCESS_SECRET',
      );

    const refreshSecret =
      this.configService.getOrThrow<string>(
        'JWT_REFRESH_SECRET',
      );

    const [
      accessToken,
      refreshToken,
    ] = await Promise.all([
      this.jwtService.signAsync(
        accessPayload,
        {
          secret: accessSecret,

          expiresIn:
            this.accessTokenExpiresIn,
        },
      ),

      this.jwtService.signAsync(
        refreshPayload,
        {
          secret: refreshSecret,

          expiresIn:
            this.refreshTokenExpiresIn,
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private getRefreshTokenExpirationDate(): Date {
    return new Date(
      Date.now() +
        this.refreshTokenExpiresIn *
          1000,
    );
  }

  private generateOrganizationSlug(
    businessName: string,
  ): string {
    const normalized =
      businessName
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(
          /[\u0300-\u036f]/g,
          '',
        )
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

    const safeBase =
      normalized || 'workspace';

    const suffix =
      randomBytes(3).toString('hex');

    return `${safeBase}-${suffix}`;
  }
}