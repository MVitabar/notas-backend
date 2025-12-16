import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateExtracurricularDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  codigo: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsBoolean()
  @IsOptional()
  activa: boolean = true;
}
