import {
  Type,
} from 'class-transformer';

import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export type LeadListFilter =
  | 'all'
  | 'hot'
  | 'warm'
  | 'attention';

export type LeadListSort =
  | 'priority'
  | 'value-high'
  | 'value-low'
  | 'company';

export class QueryLeadsDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @IsOptional()
  @IsIn([
    'all',
    'hot',
    'warm',
    'attention',
  ])
  filter?: LeadListFilter;

  @IsOptional()
  @IsIn([
    'priority',
    'value-high',
    'value-low',
    'company',
  ])
  sort?: LeadListSort;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(5)
  @Max(100)
  pageSize?: number;
}
