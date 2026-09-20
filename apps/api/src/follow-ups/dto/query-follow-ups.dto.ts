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

export type FollowUpFilter =
  | 'all'
  | 'pending'
  | 'overdue'
  | 'completed'
  | 'cancelled';

export type FollowUpSort =
  | 'due'
  | 'recent'
  | 'client';

export class QueryFollowUpsDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @IsOptional()
  @IsIn([
    'all',
    'pending',
    'overdue',
    'completed',
    'cancelled',
  ])
  filter?: FollowUpFilter;

  @IsOptional()
  @IsIn([
    'due',
    'recent',
    'client',
  ])
  sort?: FollowUpSort;

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
