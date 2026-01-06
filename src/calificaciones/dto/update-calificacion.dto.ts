import { 
  TipoCalificacion, 
  ValorConceptual 
} from './create-calificacion.dto';
import { 
  IsUUID, 
  IsNotEmpty, 
  IsNumber, 
  Min, 
  Max, 
  IsInt, 
  IsOptional, 
  IsEnum, 
  ValidateIf,
  IsString,
  IsDefined
} from 'class-validator';

export class UpdateCalificacionDto {
  @IsUUID()
  @IsOptional()
  id?: string;

  @IsUUID()
  @IsOptional()
  materiaId?: string;

  @IsUUID()
  @IsOptional()
  periodoId?: string;

  @IsEnum(TipoCalificacion)
  @IsOptional()
  tipoCalificacion?: TipoCalificacion;

  @IsNumber()
  @IsInt()
  @Min(1, { message: 'La calificación mínima es 1' })
  @Max(100, { message: 'La calificación máxima es 100' })
  @ValidateIf(o => o.tipoCalificacion === TipoCalificacion.NUMERICA || !o.tipoCalificacion)
  @IsOptional()
  calificacion?: number;

  @IsEnum(ValorConceptual)
  @ValidateIf(o => o.tipoCalificacion === TipoCalificacion.CONCEPTUAL || !o.tipoCalificacion)
  @IsOptional()
  valorConceptual?: ValorConceptual;

  @IsString()
  @IsOptional()
  tipoEvaluacion?: string;

  @IsString()
  @IsOptional()
  comentario?: string;

  @IsString()
  @IsOptional()
  unidad?: string;

  // Validador personalizado
  validate?() {
    if (this.tipoCalificacion === TipoCalificacion.NUMERICA && this.calificacion === undefined) {
      throw new Error('La calificación numérica es requerida');
    }
    if (this.tipoCalificacion === TipoCalificacion.CONCEPTUAL && !this.valorConceptual) {
      throw new Error('El valor conceptual es requerido');
    }
    
    // Validar que si se está actualizando el tipo de calificación, se proporcione el valor correspondiente
    if (this.tipoCalificacion === TipoCalificacion.NUMERICA && this.calificacion === null) {
      throw new Error('La calificación numérica no puede ser nula');
    }
    
    if (this.tipoCalificacion === TipoCalificacion.CONCEPTUAL && this.valorConceptual === null) {
      throw new Error('El valor conceptual no puede ser nulo');
    }
  }
}
