export class TeacherResponseDto {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  activo: boolean;
  materias: string[];
}
