import {
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class QueryFollowUpLeadOptionsDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;
}
