import {
  Injectable,
} from '@nestjs/common';

import {
  PrismaService,
} from '../prisma/prisma.service';

@Injectable()
export class MembersService {
  constructor(
    private readonly prisma:
      PrismaService,
  ) {}

  async findAll(
    organizationId: string,
    currentUserId: string,
  ) {
    const members =
      await this.prisma.organizationMember.findMany({
        where: {
          organizationId,
        },

        select: {
          id: true,
          role: true,
          createdAt: true,

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
        },

        orderBy: [
          {
            role:
              'asc',
          },

          {
            createdAt:
              'asc',
          },
        ],
      });

    return {
      data:
        members.map(
          (
            member,
          ) => ({
            id:
              member.id,

            role:
              member.role,

            joinedAt:
              member.createdAt,

            isCurrentUser:
              member.user.id ===
              currentUserId,

            user:
              member.user,
          }),
        ),

      meta: {
        total:
          members.length,
      },
    };
  }
}
