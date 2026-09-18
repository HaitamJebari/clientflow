import {
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class QueryProposalLeadOptionsDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;
}
