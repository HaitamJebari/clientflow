import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

import {
  FollowUpChannel,
} from '../../generated/prisma/enums';

export class UpdateFollowUpDto {
  @IsOptional()
  @IsEnum(FollowUpChannel)
  channel?: FollowUpChannel;

  @IsOptional()
  @IsDateString()
  scheduledFor?: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  subject?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(8000)
  draftMessage?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(1200)
  reason?: string | null;
}
