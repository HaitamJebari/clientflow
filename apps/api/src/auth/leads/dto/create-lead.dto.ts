import { Type } from 'class-transformer';

import {
  IsDate,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Min,
} from 'class-validator';

import {
  LeadQualification,
  LeadStage,
  LeadTemperature,
} from '../../../generated/prisma/enums';

export class CreateLeadDto {
  @IsString()
  @IsNotEmpty()
  firstName!: string;

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
  @IsDate()
  lastActivityAt?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  lastContactedAt?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  nextFollowUpAt?: Date;
}