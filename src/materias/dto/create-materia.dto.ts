import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean, IsUUID } from 'class-validator';

export class CreateMateriaDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  codigo: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsNumber()
  @IsNotEmpty()
  creditos: number;

  @IsBoolean()
  @IsOptional()
  activa?: boolean = true;

  @IsString()
  @IsUUID()
  @IsOptional()
  tipoMateriaId?: string;
}
