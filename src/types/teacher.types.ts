// src/types/teacher.types.ts

// Teacher profile type
import { User, UserRole } from '@prisma/client';

export interface TeacherProfile {
  id: string;
  userId: string;
  contactoEmergencia: string | null;
  telefonoEmergencia: string | null;
  grados: string[];
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export type UserWithoutPassword = Omit<User, 'password'> & {
  perfilDocente?: TeacherProfile | null;
  materias?: Array<{
    materia: {
      id: string;
      nombre: string;
    };
  }>;
};

export interface RegisterTeacherDto {
  // User fields
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  telefono?: string;
  direccion?: string;
  fechaNacimiento?: string;
  dni?: string;
  
  // Teacher specific fields
  contactoEmergencia?: string;
  telefonoEmergencia?: string;
  
  // System fields
  rol?: UserRole;
  activo?: boolean;
  requiresPasswordChange?: boolean;
  
  // Arrays
  materias?: string[];
  grados?: string[];
  
  // Status
  status?: 'active' | 'inactive';
}