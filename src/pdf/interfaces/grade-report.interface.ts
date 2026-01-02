export interface Student {
  id: string;
  nombre: string;
  apellido: string;
  dni: string;
  grado: string;
  seccion: string;
  anio: string;
}

export interface Materia {
  id: string;
  nombre_materia: string;
  u1: string | number;
  u2: string | number;
  u3: string | number;
  u4: string | number;
  final: string | number;
}

export interface EvaluacionExtracurricular {
  id: string;
  nombre: string;
  u1: string | number | null;
  u2: string | number | null;
  u3: string | number | null;
  u4: string | number | null;
  comentario?: string | null;
}

export interface Habito {
  id: string;
  nombre: string;
  u1: string | number | null;
  u2: string | number | null;
  u3: string | number | null;
  u4: string | number | null;
  comentario?: string | null;
}

export interface GradeReportData {
  estudiante: Student;
  materias: Materia[];
  extracurriculares_valorativas: EvaluacionExtracurricular[];
  responsabilidad_aprendizaje: Habito[];
  responsabilidad_comportamiento: Habito[];
  habitos_casa: Habito[];
  todas_las_evaluaciones?: EvaluacionExtracurricular[]; // Para compatibilidad
  promedios: {
    u1: number;
    u2: number;
    u3: number;
    u4: number;
  };
}
