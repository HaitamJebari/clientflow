import {
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateOrganizationDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsUrl({
    require_protocol: true,
  })
  website?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  industry?: string | null;
}