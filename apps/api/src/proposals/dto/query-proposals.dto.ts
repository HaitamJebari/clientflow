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

export type ProposalFilter =
  | 'all'
  | 'DRAFT'
  | 'SENT'
  | 'VIEWED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'EXPIRED';

export type ProposalSort =
  | 'recent'
  | 'title'
  | 'amount'
  | 'status';

export class QueryProposalsDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @IsOptional()
  @IsIn([
    'all',
    'DRAFT',
    'SENT',
    'VIEWED',
    'ACCEPTED',
    'REJECTED',
    'EXPIRED',
  ])
  filter?: ProposalFilter;

  @IsOptional()
  @IsIn([
    'recent',
    'title',
    'amount',
    'status',
  ])
  sort?: ProposalSort;

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
