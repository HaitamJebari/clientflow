import {
  IsEnum,
  IsOptional,
  IsUUID,
} from 'class-validator';

export enum GenerateFollowUpTone {
  PROFESSIONAL = 'professional',
  FRIENDLY = 'friendly',
  SHORT = 'short',
  DIRECT = 'direct',
  WARM = 'warm',
}

export class GenerateFollowUpDto {
  @IsUUID()
  leadId!: string;

  @IsOptional()
  @IsEnum(
    GenerateFollowUpTone,
  )
  tone?:
    GenerateFollowUpTone;
}
