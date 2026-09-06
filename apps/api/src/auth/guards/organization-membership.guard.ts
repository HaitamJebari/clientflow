import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import { JwtPayload } from '../types/jwt-payload.type';

@Injectable()
export class OrganizationMembershipGuard
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
      request.user as JwtPayload;

    const membership =
      await this.prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId:
              user.organizationId,

            userId:
              user.sub,
          },
        },

        select: {
          id: true,
          role: true,
        },
      });

    if (!membership) {
      throw new ForbiddenException(
        'You do not have access to this organization.',
      );
    }

    request.membership =
      membership;

    return true;
  }
}