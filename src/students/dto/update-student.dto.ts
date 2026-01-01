import { IsString, IsOptional, IsBoolean, IsArray, IsEmail } from 'class-validator';

export class UpdateStudentDto {
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsOptional()
  apellido?: string;

  @IsString()
  @IsOptional()
  fechaNacimiento?: string;

  @IsString()
  @IsOptional()
  dni?: string;

  @IsString()
  @IsOptional()
  direccion?: string;

  @IsString()
  @IsOptional()
  telefono?: string;

  @IsString()
  @IsOptional()
  contactoEmergencia?: string;

  @IsString()
  @IsOptional()
  telefonoEmergencia?: string;

  @IsString()
  @IsOptional()
  emergencyContact?: string;

  @IsString()
  @IsOptional()
  emergencyPhone?: string;

  @IsString()
  @IsOptional()
  parentPhone?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  correoElectronico?: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  grados?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  materias?: string[];
}
