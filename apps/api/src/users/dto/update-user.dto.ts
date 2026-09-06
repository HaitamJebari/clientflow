import {
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  firstName?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  lastName?: string | null;
}