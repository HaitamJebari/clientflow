import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  createHash,
  randomBytes,
} from 'node:crypto';

import {
  OrganizationRole,
} from '../generated/prisma/enums';

import {
  EmailService,
} from '../email/email.service';

import {
  PrismaService,
} from '../prisma/prisma.service';

import {
  CreateMemberInvitationDto,
} from './dto/create-member-invitation.dto';

import {
  UpdateMemberRoleDto,
} from './dto/update-member-role.dto';

const invitationLifetimeMs =
  7 *
  24 *
  60 *
  60 *
  1000;

function normalizeEmail(
  value: string,
) {
  return value
    .trim()
    .toLowerCase();
}

function hashToken(
  value: string,
) {
  return createHash(
    'sha256',
  )
    .update(
      value,
    )
    .digest(
      'hex',
    );
}

@Injectable()
export class MembersService {
  constructor(
    private readonly prisma:
      PrismaService,

    private readonly emailService:
      EmailService,
  ) {}

  async findAll(
    organizationId: string,
    currentUserId: string,
  ) {
    const [
      viewer,
      members,
    ] =
      await Promise.all([
        this.getMembership(
          organizationId,
          currentUserId,
        ),

        this.prisma.organizationMember.findMany({
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
              createdAt:
                'asc',
            },
          ],
        }),
      ]);

    return {
      viewerRole:
        viewer.role,

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

  async findInvitations(
    organizationId: string,
    currentUserId: string,
  ) {
    await this.assertManager(
      organizationId,
      currentUserId,
    );

    const now =
      new Date();

    const invitations =
      await this.prisma.organizationInvitation.findMany({
        where: {
          organizationId,

          acceptedAt:
            null,

          revokedAt:
            null,

          expiresAt: {
            gt:
              now,
          },
        },

        select: {
          id: true,
          email: true,
          role: true,
          expiresAt: true,
          createdAt: true,

          invitedBy: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },

        orderBy: {
          createdAt:
            'desc',
        },
      });

    return {
      data:
        invitations,

      meta: {
        total:
          invitations.length,
      },
    };
  }

  async createInvitation(
    organizationId: string,
    currentUserId: string,

    dto:
      CreateMemberInvitationDto,
  ) {
    const manager =
      await this.assertManager(
        organizationId,
        currentUserId,
      );

    const email =
      normalizeEmail(
        dto.email,
      );

    const role =
      dto.role ??
      OrganizationRole.MEMBER;

    if (
      role ===
      OrganizationRole.OWNER
    ) {
      throw new BadRequestException(
        'Owner access cannot be granted through an invitation. Invite the person as Admin or Member, then transfer ownership separately.',
      );
    }

    if (
      manager.role ===
        OrganizationRole.ADMIN &&
      role !==
        OrganizationRole.MEMBER
    ) {
      throw new ForbiddenException(
        'Admins can only invite workspace members.',
      );
    }

    const existingMember =
      await this.prisma.organizationMember.findFirst({
        where: {
          organizationId,

          user: {
            is: {
              email,
            },
          },
        },

        select: {
          id: true,
        },
      });

    if (
      existingMember
    ) {
      throw new ConflictException(
        'A user with this email is already a member of the workspace.',
      );
    }

    const now =
      new Date();

    const existingInvitation =
      await this.prisma.organizationInvitation.findFirst({
        where: {
          organizationId,
          email,

          acceptedAt:
            null,

          revokedAt:
            null,

          expiresAt: {
            gt:
              now,
          },
        },

        select: {
          id: true,
        },
      });

    if (
      existingInvitation
    ) {
      throw new ConflictException(
        'A pending invitation already exists for this email address.',
      );
    }

    const rawToken =
      randomBytes(
        32,
      ).toString(
        'base64url',
      );

    const tokenHash =
      hashToken(
        rawToken,
      );

    const expiresAt =
      new Date(
        now.getTime() +
        invitationLifetimeMs,
      );

    const [
      organization,
      inviter,
    ] =
      await Promise.all([
        this.prisma.organization.findUnique({
          where: {
            id:
              organizationId,
          },

          select: {
            name:
              true,
          },
        }),

        this.prisma.user.findUnique({
          where: {
            id:
              currentUserId,
          },

          select: {
            email:
              true,

            firstName:
              true,

            lastName:
              true,
          },
        }),
      ]);

    if (
      !organization ||
      !inviter
    ) {
      throw new NotFoundException(
        'Workspace or inviter could not be found.',
      );
    }

    const invitation =
      await this.prisma.organizationInvitation.create({
        data: {
          organizationId,

          invitedByUserId:
            currentUserId,

          email,
          role,

          tokenHash,

          expiresAt,
        },

        select: {
          id: true,
          email: true,
          role: true,
          expiresAt: true,
          createdAt: true,
        },
      });

    const inviterName =
      [
        inviter.firstName,
        inviter.lastName,
      ]
        .filter(
          Boolean,
        )
        .join(
          ' ',
        )
        .trim() ||
      inviter.email;

    try {
      const emailResult =
        await this.emailService.sendWorkspaceInvitation({
          invitationId:
            invitation.id,

          to:
            invitation.email,

          organizationName:
            organization.name,

          inviterName,

          role:
            invitation.role,

          token:
            rawToken,

          expiresAt:
            invitation.expiresAt,
        });

      return {
        invitation,

        emailSent:
          true,

        emailMessageId:
          emailResult.id,
      };
    } catch (
      error
    ) {
      /*
       * Never leave a visibly-active invitation behind when
       * the transactional email request did not complete.
       */
      await this.prisma.organizationInvitation.update({
        where: {
          id:
            invitation.id,
        },

        data: {
          revokedAt:
            new Date(),
        },
      });

      throw error;
    }
  }

  async revokeInvitation(
    organizationId: string,
    currentUserId: string,
    invitationId: string,
  ) {
    const manager =
      await this.assertManager(
        organizationId,
        currentUserId,
      );

    const invitation =
      await this.prisma.organizationInvitation.findFirst({
        where: {
          id:
            invitationId,

          organizationId,

          acceptedAt:
            null,

          revokedAt:
            null,
        },

        select: {
          id: true,
          role: true,
        },
      });

    if (
      !invitation
    ) {
      throw new NotFoundException(
        'Pending invitation not found.',
      );
    }

    if (
      manager.role ===
        OrganizationRole.ADMIN &&
      invitation.role !==
        OrganizationRole.MEMBER
    ) {
      throw new ForbiddenException(
        'Admins can only manage Member invitations.',
      );
    }

    await this.prisma.organizationInvitation.update({
      where: {
        id:
          invitation.id,
      },

      data: {
        revokedAt:
          new Date(),
      },
    });

    return {
      success:
        true,
    };
  }

  async updateRole(
    organizationId: string,
    currentUserId: string,
    memberId: string,

    dto:
      UpdateMemberRoleDto,
  ) {
    const viewer =
      await this.getMembership(
        organizationId,
        currentUserId,
      );

    if (
      viewer.role !==
      OrganizationRole.OWNER
    ) {
      throw new ForbiddenException(
        'Only workspace owners can change member roles.',
      );
    }

    const target =
      await this.prisma.organizationMember.findFirst({
        where: {
          id:
            memberId,

          organizationId,
        },

        select: {
          id: true,
          userId: true,
          role: true,
        },
      });

    if (!target) {
      throw new NotFoundException(
        'Workspace member not found.',
      );
    }

    if (
      target.role ===
        dto.role
    ) {
      return this.prisma.organizationMember.findUnique({
        where: {
          id:
            target.id,
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
            },
          },
        },
      });
    }

    if (
      target.role ===
        OrganizationRole.OWNER &&
      dto.role !==
        OrganizationRole.OWNER
    ) {
      const ownerCount =
        await this.prisma.organizationMember.count({
          where: {
            organizationId,

            role:
              OrganizationRole.OWNER,
          },
        });

      if (
        ownerCount <=
        1
      ) {
        throw new BadRequestException(
          'The workspace must always have at least one owner.',
        );
      }
    }

    return this.prisma.organizationMember.update({
      where: {
        id:
          target.id,
      },

      data: {
        role:
          dto.role,
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
          },
        },
      },
    });
  }

  async removeMember(
    organizationId: string,
    currentUserId: string,
    memberId: string,
  ) {
    const viewer =
      await this.assertManager(
        organizationId,
        currentUserId,
      );

    const target =
      await this.prisma.organizationMember.findFirst({
        where: {
          id:
            memberId,

          organizationId,
        },

        select: {
          id: true,
          userId: true,
          role: true,

          user: {
            select: {
              email: true,
            },
          },
        },
      });

    if (!target) {
      throw new NotFoundException(
        'Workspace member not found.',
      );
    }

    if (
      target.userId ===
      currentUserId
    ) {
      throw new BadRequestException(
        'You cannot remove your own active workspace membership from this screen.',
      );
    }

    if (
      viewer.role ===
        OrganizationRole.ADMIN &&
      target.role !==
        OrganizationRole.MEMBER
    ) {
      throw new ForbiddenException(
        'Admins can only remove members.',
      );
    }

    if (
      target.role ===
      OrganizationRole.OWNER
    ) {
      const ownerCount =
        await this.prisma.organizationMember.count({
          where: {
            organizationId,

            role:
              OrganizationRole.OWNER,
          },
        });

      if (
        ownerCount <=
        1
      ) {
        throw new BadRequestException(
          'The last workspace owner cannot be removed.',
        );
      }
    }

    const now =
      new Date();

    await this.prisma.$transaction(
      async (
        tx,
      ) => {
        await tx.session.updateMany({
          where: {
            userId:
              target.userId,

            organizationId,

            revokedAt:
              null,
          },

          data: {
            revokedAt:
              now,
          },
        });

        await tx.organizationMember.delete({
          where: {
            id:
              target.id,
          },
        });
      },
    );

    return {
      success:
        true,

      removedUserEmail:
        target.user.email,
    };
  }

  private async assertManager(
    organizationId: string,
    currentUserId: string,
  ) {
    const membership =
      await this.getMembership(
        organizationId,
        currentUserId,
      );

    if (
      membership.role !==
        OrganizationRole.OWNER &&
      membership.role !==
        OrganizationRole.ADMIN
    ) {
      throw new ForbiddenException(
        'You do not have permission to manage workspace members.',
      );
    }

    return membership;
  }

  private async getMembership(
    organizationId: string,
    userId: string,
  ) {
    const membership =
      await this.prisma.organizationMember.findFirst({
        where: {
          organizationId,
          userId,
        },

        select: {
          id: true,
          role: true,
        },
      });

    if (!membership) {
      throw new ForbiddenException(
        'You are not a member of this workspace.',
      );
    }

    return membership;
  }
}
