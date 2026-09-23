import {
  IsEmail,
  IsEnum,
  IsOptional,
} from 'class-validator';

import {
  OrganizationRole,
} from '../../generated/prisma/enums';

export class CreateMemberInvitationDto {
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsEnum(
    OrganizationRole,
  )
  role?:
    OrganizationRole;
}
