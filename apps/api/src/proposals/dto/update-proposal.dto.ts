import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateProposalDto {
  @IsOptional()
  @IsString()
  @MaxLength(180)
  title?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  amountCents?: number;

  @IsOptional()
  @IsString()
  @MaxLength(8)
  currency?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  summary?: string;

  @IsOptional()
  @IsString()
  @MaxLength(12000)
  scope?: string;

  @IsOptional()
  @IsString()
  @MaxLength(6000)
  timeline?: string;

  @IsOptional()
  @IsString()
  @MaxLength(6000)
  terms?: string;

  @IsOptional()
  @IsDateString()
  validUntil?: string | null;
}
