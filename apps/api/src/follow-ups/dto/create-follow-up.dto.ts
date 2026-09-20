import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

import {
  FollowUpChannel,
} from '../../generated/prisma/enums';

export class CreateFollowUpDto {
  @IsUUID()
  leadId!: string;

  @IsEnum(FollowUpChannel)
  channel!: FollowUpChannel;

  @IsDateString()
  scheduledFor!: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  subject?: string;

  @IsOptional()
  @IsString()
  @MaxLength(8000)
  draftMessage?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1200)
  reason?: string;
}
