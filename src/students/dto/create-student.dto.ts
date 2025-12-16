import { IsString, IsDateString, IsOptional, IsBoolean, IsArray, IsEmail, IsNotEmpty } from 'class-validator';

export class CreateStudentDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  apellido: string;

  @IsDateString()
  @IsOptional()
  fechaNacimiento?: string;

  @IsString()
  @IsNotEmpty()
  dni: string;

  @IsString()
  @IsOptional()
  direccion?: string;

  @IsString()
  @IsOptional()
  telefono?: string;

  // Backend field names
  @IsString()
  @IsOptional()
  contactoEmergencia?: string;

  @IsString()
  @IsOptional()
  telefonoEmergencia?: string;

  // Frontend field names
  @IsString()
  @IsOptional()
  emergencyContact?: string;

  @IsString()
  @IsOptional()
  emergencyPhone?: string;

  @IsString()
  @IsOptional()
  parentPhone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  // Alias for email
  @IsEmail()
  @IsOptional()
  correoElectronico?: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean = true;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  grados?: string[] = [];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  materias?: string[] = [];
}
