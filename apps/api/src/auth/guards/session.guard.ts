import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload } from '../types/jwt-payload.type';

@Injectable()
export class SessionGuard
  implements CanActivate
{
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest();

    const user =
      request.user as JwtPayload | undefined;

    if (!user) {
      throw new UnauthorizedException();
    }

    const session =
      await this.prisma.session.findFirst({
        where: {
          id: user.sessionId,
          userId: user.sub,
          organizationId:
            user.organizationId,

          revokedAt: null,

          expiresAt: {
            gt: new Date(),
          },
        },

        select: {
          id: true,
        },
      });

    if (!session) {
      throw new UnauthorizedException(
        'Session is no longer active.',
      );
    }

    return true;
  }
}