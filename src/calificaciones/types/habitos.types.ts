export interface GrupoHabito {
  id: string;
  nombre: string;
  u1: string | null;
  u2: string | null;
  u3: string | null;
  u4: string | null;
  comentario: string | null;
}

export interface HabitoEstudiante {
  id?: string;
  evaluacionHabitoId: string;
  nombre: string;
  descripcion: string | null;
  tipo: string;
  tipoMateriaId?: string; // Agregar el ID del tipo de materia
  grados?: string[]; // Grados asignados a la materia
  u1: string | null;
  u2: string | null;
  u3: string | null;
  u4: string | null;
  comentario: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  calificaciones?: any[]; // Array de calificaciones históricas
  esMateria: boolean;
}

export interface ResumenHabitos {
  habito_casa: GrupoHabito[];
  responsabilidad_aprendizaje: GrupoHabito[];
  comportamiento: GrupoHabito[];
}
