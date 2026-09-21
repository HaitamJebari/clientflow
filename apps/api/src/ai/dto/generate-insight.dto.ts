import {
  IsUUID,
} from 'class-validator';

export class GenerateInsightDto {
  @IsUUID()
  leadId!: string;
}
