import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getCurrent(
    userId: string,
    organizationId: string,
  ) {
    const membership =
      await this.prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId,
            userId,
          },
        },

        include: {
          organization: true,
        },
      });

    if (!membership) {
      throw new NotFoundException(
        'Organization not found.',
      );
    }

    return {
      ...membership.organization,
      role: membership.role,
    };
  }

  async updateCurrent(
    organizationId: string,
    dto: UpdateOrganizationDto,
  ) {
    return this.prisma.organization.update({
      where: {
        id: organizationId,
      },

      data: {
        name:
          dto.name !== undefined
            ? dto.name.trim()
            : undefined,

        website:
          dto.website !== undefined
            ? dto.website?.trim() || null
            : undefined,

        industry:
          dto.industry !== undefined
            ? dto.industry?.trim() || null
            : undefined,
      },

      select: {
        id: true,
        name: true,
        slug: true,
        website: true,
        industry: true,
        updatedAt: true,
      },
    });
  }
}