import { 
  IsEmail, 
  IsString, 
  IsOptional, 
  MinLength, 
  IsEnum, 
  IsArray, 
  IsNotEmpty, 
  IsDateString, 
  IsBoolean,
  Matches,
  IsIn
} from 'class-validator'
import { UserRole } from '../enums/user-role.enum'

export class CreateUserDto {
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  email: string

  @IsString({ message: 'La contraseña debe ser un texto' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string

  @IsString({ message: 'El nombre debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre: string

  @IsString({ message: 'El apellido debe ser un texto' })
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  apellido: string

  @IsString({ message: 'El teléfono debe ser un texto' })
  @IsOptional()
  @Matches(/^[0-9\s\-+()]*$/, { 
    message: 'El número de teléfono no es válido. Solo se permiten números, espacios y los caracteres +-()' 
  })
  telefono?: string

  @IsString({ message: 'La dirección debe ser un texto' })
  @IsOptional()
  direccion?: string

  @IsDateString({}, { message: 'La fecha de nacimiento no es válida' })
  @IsOptional()
  fechaNacimiento?: string

  @IsString({ message: 'El DNI debe ser un texto' })
  @IsOptional()
  dni?: string

  @IsString({ message: 'El contacto de emergencia debe ser un texto' })
  @IsOptional()
  contactoEmergencia?: string

  @IsString({ message: 'El teléfono de emergencia debe ser un texto' })
  @IsOptional()
  @Matches(/^[0-9\s\-+()]*$/, { 
    message: 'El número de teléfono de emergencia no es válido. Solo se permiten números, espacios y los caracteres +-()' 
  })
  telefonoEmergencia?: string

  @IsEnum(UserRole, { message: 'Rol de usuario no válido' })
  @IsOptional()
  rol: UserRole = UserRole.DOCENTE

  @IsBoolean({ message: 'El estado debe ser un valor booleano' })
  @IsOptional()
  activo: boolean = true

  @IsBoolean({ message: 'El campo requiresPasswordChange debe ser un valor booleano' })
  @IsOptional()
  requiresPasswordChange: boolean = true

  @IsArray({ message: 'Las materias deben ser un arreglo' })
  @IsString({ each: true, message: 'Cada materia debe ser un texto' })
  @IsOptional()
  materias: string[] = []

  @IsArray({ message: 'Los grados deben ser un arreglo' })
  @IsString({ each: true, message: 'Cada grado debe ser un texto' })
  @IsOptional()
  grados: string[] = []

  @IsString({ message: 'El estado debe ser un texto' })
  @IsIn(['active', 'inactive'], { message: 'El estado debe ser "active" o "inactive"' })
  @IsOptional()
  status: string = 'active'
}
