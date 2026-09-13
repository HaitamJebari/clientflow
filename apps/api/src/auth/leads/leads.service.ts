import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';

@Injectable()
export class LeadsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(
    organizationId: string,
    dto: CreateLeadDto,
  ) {
    return this.prisma.lead.create({
      data: {
        organizationId,
        ...dto,
        currency:
          dto.currency?.toUpperCase() ??
          'EUR',
      },
    });
  }

  async findAll(
    organizationId: string,
  ) {
    return this.prisma.lead.findMany({
      where: {
        organizationId,
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(
    organizationId: string,
    id: string,
  ) {
    const lead =
      await this.prisma.lead.findFirst({
        where: {
          id,
          organizationId,
        },
      });

    if (!lead) {
      throw new NotFoundException(
        'Lead not found',
      );
    }

    return lead;
  }

  async update(
    organizationId: string,
    id: string,
    dto: UpdateLeadDto,
  ) {
    await this.findOne(
      organizationId,
      id,
    );

    return this.prisma.lead.update({
      where: {
        id,
      },

      data: {
        ...dto,

        ...(dto.currency && {
          currency:
            dto.currency.toUpperCase(),
        }),
      },
    });
  }

  async remove(
    organizationId: string,
    id: string,
  ) {
    await this.findOne(
      organizationId,
      id,
    );

    await this.prisma.lead.delete({
      where: {
        id,
      },
    });

    return {
      success: true,
      message: 'Lead deleted successfully',
    };
  }
}