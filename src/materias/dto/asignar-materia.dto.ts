// src/materias/dto/asignar-materia.dto.ts
import { IsString, IsNotEmpty, IsUUID, IsOptional } from 'class-validator';

export class AsignarMateriaDto {
  @IsUUID()
  @IsNotEmpty({ message: 'El ID de la materia es requerido' })
  materiaId: string;

  @IsUUID()
  @IsNotEmpty({ message: 'El ID del docente es requerido' })
  docenteId: string;

  @IsString()
  @IsNotEmpty({ message: 'La sección es requerida' })
  seccion: string;

  @IsString()
  @IsNotEmpty({ message: 'El horario es requerido' })
  horario: string;

  @IsString()
  @IsNotEmpty({ message: 'El período es requerido' })
  periodo: string;

  @IsString()
  @IsOptional()
  estado?: string;
}