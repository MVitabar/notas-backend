import { IsString, IsDateString, IsBoolean, IsOptional, IsIn } from 'class-validator';

export class CreateAcademicPeriodDto {
  @IsString()
  name: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsBoolean()
  @IsOptional()
  isCurrent?: boolean;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsIn(['upcoming', 'active', 'completed', 'cancelled'])
  @IsOptional()
  status?: 'upcoming' | 'active' | 'completed' | 'cancelled';
}
