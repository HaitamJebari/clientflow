import {
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class AcceptInvitationRegisterDto {
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  firstName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  lastName?: string;

  @IsString()
  @MinLength(12)
  @MaxLength(200)
  password!: string;
}
