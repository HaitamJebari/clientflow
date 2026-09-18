import { Type } from 'class-transformer';

import {
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Max,
  Min,
} from 'class-validator';

import {
  LeadQualification,
  LeadStage,
  LeadTemperature,
} from '../../generated/prisma/enums';

export class UpdateLeadDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsString()
  jobTitle?: string;

  @IsOptional()
  @IsUrl({
    require_protocol: true,
  })
  website?: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsEnum(LeadStage)
  stage?: LeadStage;

  @IsOptional()
  @IsEnum(LeadTemperature)
  temperature?: LeadTemperature;

  @IsOptional()
  @IsEnum(LeadQualification)
  qualification?: LeadQualification;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  valueCents?: number;

  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @Type(() => Date)
  nextFollowUpAt?: Date;

  @IsOptional()
  @Type(() => Date)
  lastContactedAt?: Date;

  @IsOptional()
  @Type(() => Date)
  lastActivityAt?: Date;

  @IsOptional()
  @IsString()
  aiSummary?: string;

  @IsOptional()
  @IsString()
  aiNextBestAction?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  aiInformationConfidence?: number;
}