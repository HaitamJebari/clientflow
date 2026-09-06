import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getMe(userId: string) {
    const user =
      await this.prisma.user.findUnique({
        where: {
          id: userId,
        },

        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      });

    if (!user) {
      throw new NotFoundException(
        'User not found.',
      );
    }

    return user;
  }

  async updateMe(
    userId: string,
    dto: UpdateUserDto,
  ) {
    return this.prisma.user.update({
      where: {
        id: userId,
      },

      data: {
        firstName:
          dto.firstName !== undefined
            ? dto.firstName?.trim() || null
            : undefined,

        lastName:
          dto.lastName !== undefined
            ? dto.lastName?.trim() || null
            : undefined,
      },

      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        emailVerified: true,
        updatedAt: true,
      },
    });
  }
}