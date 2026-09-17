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

export type ContactFilter =
  | 'all'
  | 'active'
  | 'clients'
  | 'inactive';

export type ContactSort =
  | 'recent'
  | 'name'
  | 'company'
  | 'value';

export class QueryContactsDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @IsOptional()
  @IsIn([
    'all',
    'active',
    'clients',
    'inactive',
  ])
  filter?: ContactFilter;

  @IsOptional()
  @IsIn([
    'recent',
    'name',
    'company',
    'value',
  ])
  sort?: ContactSort;

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
