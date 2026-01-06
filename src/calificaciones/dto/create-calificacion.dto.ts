import { 
  IsString, 
  IsNumber, 
  Min, 
  Max, 
  IsUUID, 
  IsOptional, 
  IsNotEmpty, 
  IsInt, 
  IsEnum, 
  ValidateIf,
  IsBoolean
} from 'class-validator';

export enum TipoCalificacion {
  NUMERICA = 'NUMERICA',
  CONCEPTUAL = 'CONCEPTUAL'
}

export enum ValorConceptual {
  DESTACA = 'DESTACA',
  AVANZA = 'AVANZA',
  NECESITA_MEJORAR = 'NECESITA_MEJORAR',
  INSATISFACTORIO = 'INSATISFACTORIO'
}

export class CreateCalificacionDto {
  @IsUUID()
  @IsNotEmpty()
  estudianteId: string;

  @IsUUID()
  @IsOptional()
  @ValidateIf(o => !o.esExtraescolar)
  materiaId?: string;

  @IsUUID()
  @IsOptional()
  @ValidateIf(o => !o.esExtraescolar)
  userMateriaId?: string;

  @IsString()
  @IsOptional()
  nombreMateria?: string;

  @IsBoolean()
  @IsOptional()
  esExtraescolar?: boolean;

  @IsUUID()
  @IsNotEmpty()
  periodoId: string;

  @IsString()
  @IsNotEmpty()
  tipoEvaluacion: string;

  @IsEnum(TipoCalificacion)
  @IsNotEmpty()
  tipoCalificacion: TipoCalificacion;

  @IsEnum(ValorConceptual, { 
    message: 'Valor conceptual no válido. Debe ser uno de: ' + Object.values(ValorConceptual).join(', ')
  })
  @IsOptional()
  @ValidateIf(o => o.tipoCalificacion === TipoCalificacion.CONCEPTUAL)
  @IsNotEmpty({ message: 'El valor conceptual es requerido para evaluaciones conceptuales' })
  valorConceptual?: ValorConceptual;

  @IsNumber({}, { message: 'La calificación debe ser un número' })
  @Min(0, { message: 'La calificación no puede ser menor a 0' })
  @Max(100, { message: 'La calificación no puede ser mayor a 100' })
  @IsOptional()
  @ValidateIf(o => o.tipoCalificacion === TipoCalificacion.NUMERICA)
  calificacion?: number;

  @IsString()
  @IsOptional()
  comentario?: string;

  @IsString()
  @IsOptional()
  unidad?: string;

  // Validador personalizado para asegurar que al menos un tipo de calificación esté presente
  validate() {
    if (this.tipoCalificacion === TipoCalificacion.NUMERICA && this.calificacion === undefined) {
      throw new Error('La calificación numérica es requerida');
    }
    if (this.tipoCalificacion === TipoCalificacion.CONCEPTUAL && !this.valorConceptual) {
      throw new Error('El valor conceptual es requerido');
    }
  }
}
