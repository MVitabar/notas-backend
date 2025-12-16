// src/auth/dto/register.dto.ts
import { 
  IsEmail, 
  IsNotEmpty, 
  IsString, 
  IsOptional, 
  IsDateString, 
  IsArray, 
  MinLength,
  MaxLength,
  Matches
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(50, { message: 'La contraseña no puede tener más de 50 caracteres' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'La contraseña debe contener al menos una letra mayúscula, una minúscula, un número y un carácter especial',
    },
  )
  password: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @IsString()
  @IsNotEmpty()
  rol: 'USUARIO' | 'DOCENTE' | 'ADMIN';

  @IsString()
  @IsOptional()
  nationalId?: string;

  @IsString()
  @IsOptional()
  emergencyContact?: string;

  @IsString()
  @IsOptional()
  emergencyPhone?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  subjects?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  grades?: string[];

  @IsString()
  @IsOptional()
  status?: 'active' | 'inactive';
}