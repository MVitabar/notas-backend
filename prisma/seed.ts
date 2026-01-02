import { PrismaClient } from '@prisma/client';

// Definir manualmente los enums necesarios
// Estos deben coincidir exactamente con los definidos en schema.prisma
const EvaluacionTipo = {
  EXTRACURRICULAR: 'EXTRACURRICULAR',
  COMPORTAMIENTO: 'COMPORTAMIENTO',
  APRENDIZAJE: 'APRENDIZAJE',
  CASA: 'CASA'
} as const;

const TipoCalificacion = {
  NUMERICA: 'NUMERICA',
  CONCEPTUAL: 'CONCEPTUAL',
  
} as const;

// Definir los grados y sus materias
const gradosYMaterias = {
  // Primaria Baja
  '1° Primaria A': [
    "Comprensión de Lectura", "Lógica Matemática", "Respeta autoridad", 
    "Interactúa bien con sus compañeros", "Acepta responsabilidad", 
    "Practica valores morales", "Viene preparado", "Termina tareas", 
    "Lee diariamente", "Asiste a juntas", "Practica matemáticas", 
    "Practica vocabulario de inglés", "Completa trabajo a tiempo", 
    "Regresa tareas firmadas", "Participa en actividades"
  ],
  '1° Primaria B': [
    "Comprensión de Lectura", "Lógica Matemática", "Respeta autoridad", 
    "Interactúa bien con sus compañeros", "Acepta responsabilidad", 
    "Practica valores morales", "Viene preparado", "Termina tareas", 
    "Lee diariamente", "Asiste a juntas", "Practica matemáticas", 
    "Practica vocabulario de inglés", "Completa trabajo a tiempo", 
    "Regresa tareas firmadas", "Participa en actividades"
  ],
  '2° Primaria A': [
    "Comprensión de Lectura", "Lógica Matemática", "Respeta autoridad", 
    "Interactúa bien con sus compañeros", "Acepta responsabilidad", 
    "Practica valores morales", "Viene preparado", "Termina tareas", 
    "Lee diariamente", "Asiste a juntas", "Practica matemáticas", 
    "Practica vocabulario de inglés", "Completa trabajo a tiempo", 
    "Regresa tareas firmadas", "Participa en actividades"
  ],
  '2° Primaria B': [
    "Comprensión de Lectura", "Lógica Matemática", "Respeta autoridad", 
    "Interactúa bien con sus compañeros", "Acepta responsabilidad", 
    "Practica valores morales", "Viene preparado", "Termina tareas", 
    "Lee diariamente", "Asiste a juntas", "Practica matemáticas", 
    "Practica vocabulario de inglés", "Completa trabajo a tiempo", 
    "Regresa tareas firmadas", "Participa en actividades"
  ],
  '3° Primaria A': [
    "Comprensión de Lectura", "Lógica Matemática", "Respeta autoridad", 
    "Interactúa bien con sus compañeros", "Acepta responsabilidad", 
    "Practica valores morales", "Viene preparado", "Termina tareas", 
    "Lee diariamente", "Asiste a juntas", "Practica matemáticas", 
    "Practica vocabulario de inglés", "Completa trabajo a tiempo", 
    "Regresa tareas firmadas", "Participa en actividades"
  ],
  '3° Primaria B': [
    "Comprensión de Lectura", "Lógica Matemática", "Respeta autoridad", 
    "Interactúa bien con sus compañeros", "Acepta responsabilidad", 
    "Practica valores morales", "Viene preparado", "Termina tareas", 
    "Lee diariamente", "Asiste a juntas", "Practica matemáticas", 
    "Practica vocabulario de inglés", "Completa trabajo a tiempo", 
    "Regresa tareas firmadas", "Participa en actividades"
  ],
  
  // Primaria Alta
  '4° Primaria A': [
    "Programa de Lectura", "Razonamiento Verbal", "Razonamiento Matemático", 
    "Respeta autoridad", "Interactúa bien con sus compañeros", 
    "Acepta responsabilidad", "Practica valores morales", "Llega a tiempo", 
    "Viene preparado", "Termina tareas", "Lee diariamente", "Asiste a juntas", 
    "Practica matemáticas", "Practica vocabulario de inglés", 
    "Completa trabajo a tiempo", "Regresa tareas firmadas", "Participa en actividades"
  ],
  '4° Primaria B': [
    "Programa de Lectura", "Razonamiento Verbal", "Razonamiento Matemático", 
    "Respeta autoridad", "Interactúa bien con sus compañeros", 
    "Acepta responsabilidad", "Practica valores morales", "Llega a tiempo", 
    "Viene preparado", "Termina tareas", "Lee diariamente", "Asiste a juntas", 
    "Practica matemáticas", "Practica vocabulario de inglés", 
    "Completa trabajo a tiempo", "Regresa tareas firmadas", "Participa en actividades"
  ],
  '5° Primaria A': [
    "Programa de Lectura", "Razonamiento Verbal", "Razonamiento Matemático", 
    "Respeta autoridad", "Interactúa bien con sus compañeros", 
    "Acepta responsabilidad", "Practica valores morales", "Llega a tiempo", 
    "Viene preparado", "Termina tareas", "Lee diariamente", "Asiste a juntas", 
    "Practica matemáticas", "Practica vocabulario de inglés", 
    "Completa trabajo a tiempo", "Regresa tareas firmadas", "Participa en actividades"
  ],
  '5° Primaria B': [
    "Programa de Lectura", "Razonamiento Verbal", "Razonamiento Matemático", 
    "Respeta autoridad", "Interactúa bien con sus compañeros", 
    "Acepta responsabilidad", "Practica valores morales", "Llega a tiempo", 
    "Viene preparado", "Termina tareas", "Lee diariamente", "Asiste a juntas", 
    "Practica matemáticas", "Practica vocabulario de inglés", 
    "Completa trabajo a tiempo", "Regresa tareas firmadas", "Participa en actividades"
  ],
  '6° Primaria A': [
    "Programa de Lectura", "Razonamiento Verbal", "Razonamiento Matemático", 
    "Respeta autoridad", "Interactúa bien con sus compañeros", 
    "Acepta responsabilidad", "Practica valores morales", "Llega a tiempo", 
    "Viene preparado", "Termina tareas", "Lee diariamente", "Asiste a juntas", 
    "Practica matemáticas", "Practica vocabulario de inglés", 
    "Completa trabajo a tiempo", "Regresa tareas firmadas", "Participa en actividades"
  ],
  '6° Primaria B': [
    "Programa de Lectura", "Razonamiento Verbal", "Razonamiento Matemático", 
    "Respeta autoridad", "Interactúa bien con sus compañeros", 
    "Acepta responsabilidad", "Practica valores morales", "Llega a tiempo", 
    "Viene preparado", "Termina tareas", "Lee diariamente", "Asiste a juntas", 
    "Practica matemáticas", "Practica vocabulario de inglés", 
    "Completa trabajo a tiempo", "Regresa tareas firmadas", "Participa en actividades"
  ],
  
  // Básicos
  '1° Básico A': [
    "Programa de Lectura", "Moral Cristiana", "Respeta autoridad", 
    "Interactúa bien con sus compañeros", "Acepta responsabilidad", 
    "Practica valores morales", "Responsable en clases", 
    "Completa trabajos a tiempo", "Participa en actividades", "Llega a tiempo", 
    "Atiende juntas de padres", "Practica diariamente lo estudiado"
  ],
  '1° Básico B': [
    "Programa de Lectura", "Moral Cristiana", "Respeta autoridad", 
    "Interactúa bien con sus compañeros", "Acepta responsabilidad", 
    "Practica valores morales", "Responsable en clases", 
    "Completa trabajos a tiempo", "Participa en actividades", "Llega a tiempo", 
    "Atiende juntas de padres", "Practica diariamente lo estudiado"
  ],
  '1° Básico C': [
    "Programa de Lectura", "Moral Cristiana", "Respeta autoridad", 
    "Interactúa bien con sus compañeros", "Acepta responsabilidad", 
    "Practica valores morales", "Responsable en clases", 
    "Completa trabajos a tiempo", "Participa en actividades", "Llega a tiempo", 
    "Atiende juntas de padres", "Practica diariamente lo estudiado"
  ],
  '2° Básico A': [
    "Programa de Lectura", "Moral Cristiana", "Respeta autoridad", 
    "Interactúa bien con sus compañeros", "Acepta responsabilidad", 
    "Practica valores morales", "Responsable en clases", 
    "Completa trabajos a tiempo", "Participa en actividades", "Llega a tiempo", 
    "Atiende juntas de padres", "Practica diariamente lo estudiado"
  ],
  '2° Básico B': [
    "Programa de Lectura", "Moral Cristiana", "Respeta autoridad", 
    "Interactúa bien con sus compañeros", "Acepta responsabilidad", 
    "Practica valores morales", "Responsable en clases", 
    "Completa trabajos a tiempo", "Participa en actividades", "Llega a tiempo", 
    "Atiende juntas de padres", "Practica diariamente lo estudiado"
  ],
  '2° Básico C': [
    "Programa de Lectura", "Moral Cristiana", "Respeta autoridad", 
    "Interactúa bien con sus compañeros", "Acepta responsabilidad", 
    "Practica valores morales", "Responsable en clases", 
    "Completa trabajos a tiempo", "Participa en actividades", "Llega a tiempo", 
    "Atiende juntas de padres", "Practica diariamente lo estudiado"
  ],
  '3° Básico A': [
    "Programa de Lectura", "Moral Cristiana", "Respeta autoridad", 
    "Interactúa bien con sus compañeros", "Acepta responsabilidad", 
    "Practica valores morales", "Responsable en clases", 
    "Completa trabajos a tiempo", "Participa en actividades", "Llega a tiempo", 
    "Atiende juntas de padres", "Practica diariamente lo estudiado"
  ],
  '3° Básico B': [
    "Programa de Lectura", "Moral Cristiana", "Respeta autoridad", 
    "Interactúa bien con sus compañeros", "Acepta responsabilidad", 
    "Practica valores morales", "Responsable en clases", 
    "Completa trabajos a tiempo", "Participa en actividades", "Llega a tiempo", 
    "Atiende juntas de padres", "Practica diariamente lo estudiado"
  ],
  '3° Básico C': [
    "Programa de Lectura", "Moral Cristiana", "Respeta autoridad", 
    "Interactúa bien con sus compañeros", "Acepta responsabilidad", 
    "Practica valores morales", "Responsable en clases", 
    "Completa trabajos a tiempo", "Participa en actividades", "Llega a tiempo", 
    "Atiende juntas de padres", "Practica diariamente lo estudiado"
  ],
  
  // Bachillerato en Ciencias y Letras
  '4° Bachillerato en Ciencias y Letras': [
    "Razonamiento Verbal", "Programa de Lectura", "Moral Cristiana", 
    "Respeta autoridad", "Interactúa bien con sus compañeros", 
    "Acepta responsabilidad", "Practica valores morales", 
    "Responsable en clases", "Completa trabajos a tiempo", 
    "Participa en actividades", "Llega a tiempo", 
    "Atiende juntas de padres", "Practica diariamente lo estudiado"
  ],
  '5° Bachillerato en Ciencias y Letras': [
    "Razonamiento Verbal", "Programa de Lectura", "Moral Cristiana", 
    "Respeta autoridad", "Interactúa bien con sus compañeros", 
    "Acepta responsabilidad", "Practica valores morales", 
    "Responsable en clases", "Completa trabajos a tiempo", 
    "Participa en actividades", "Llega a tiempo", 
    "Atiende juntas de padres", "Practica diariamente lo estudiado"
  ],
  
  // Perito Contador
  '4° Perito Contador': [
    "Programa de Lectura", "Moral Cristiana", "Respeta autoridad", 
    "Interactúa bien con sus compañeros", "Acepta responsabilidad", 
    "Practica valores morales", "Responsable en clases", 
    "Completa trabajos a tiempo", "Participa en actividades", "Llega a tiempo", 
    "Atiende juntas de padres", "Practica diariamente lo estudiado"
  ],
  '5° Perito Contador': [
    "Programa de Lectura", "Moral Cristiana", "Respeta autoridad", 
    "Interactúa bien con sus compañeros", "Acepta responsabilidad", 
    "Practica valores morales", "Responsable en clases", 
    "Completa trabajos a tiempo", "Participa en actividades", "Llega a tiempo", 
    "Atiende juntas de padres", "Practica diariamente lo estudiado"
  ],
  '6° Perito Contador': [
    "Programa de Lectura", "Moral Cristiana", "Respeta autoridad", 
    "Interactúa bien con sus compañeros", "Acepta responsabilidad", 
    "Practica valores morales", "Responsable en clases", 
    "Completa trabajos a tiempo", "Participa en actividades", "Llega a tiempo", 
    "Atiende juntas de padres", "Practica diariamente lo estudiado"
  ]
} as const;

// Mapeo de materias a sus tipos
export const materiaTipoMap: Record<string, string> = {
  // Extracurriculares
  'Comprensión de Lectura': EvaluacionTipo.EXTRACURRICULAR,
  'Lógica Matemática': EvaluacionTipo.EXTRACURRICULAR,
  
  
  // Comportamiento
  'Respeta autoridad': EvaluacionTipo.COMPORTAMIENTO,
  'Interactúa bien con sus compañeros': EvaluacionTipo.COMPORTAMIENTO,
  'Acepta responsabilidad': EvaluacionTipo.COMPORTAMIENTO,
  'Practica valores morales': EvaluacionTipo.COMPORTAMIENTO,
  'Responsable en clases': EvaluacionTipo.COMPORTAMIENTO,
  'Llega a tiempo': EvaluacionTipo.COMPORTAMIENTO,
  
  // Hábitos de casa
  'Viene preparado': EvaluacionTipo.CASA,
  'Termina tareas': EvaluacionTipo.CASA,
  'Lee diariamente': EvaluacionTipo.CASA,
  'Asiste a juntas': EvaluacionTipo.CASA,
  'Atiende juntas de padres': EvaluacionTipo.CASA,
  'Practica diariamente lo estudiado': EvaluacionTipo.CASA,
  
  // Aprendizaje
  'Practica matemáticas': EvaluacionTipo.APRENDIZAJE,
  'Practica vocabulario de inglés': EvaluacionTipo.APRENDIZAJE,
  'Completa trabajo a tiempo': EvaluacionTipo.APRENDIZAJE,
  'Completa trabajos a tiempo': EvaluacionTipo.APRENDIZAJE,
  'Regresa tareas firmadas': EvaluacionTipo.APRENDIZAJE,
  'Participa en actividades': EvaluacionTipo.APRENDIZAJE,
  'Programa de Lectura': EvaluacionTipo.APRENDIZAJE,
  'Razonamiento Verbal': EvaluacionTipo.APRENDIZAJE,
  'Razonamiento Matemático': EvaluacionTipo.APRENDIZAJE,
  'Moral Cristiana': EvaluacionTipo.APRENDIZAJE,
};

// Función para obtener el tipo de evaluación basado en el nombre
function getTipoEvaluacion(nombre: string): string {
  return materiaTipoMap[nombre] || EvaluacionTipo.APRENDIZAJE;
}
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Crear grados
  const grados = Object.keys(gradosYMaterias);
  
  // Primero creamos todas las materias únicas de todos los grados
  const todasLasMaterias = new Set<string>();
  
  // Recolectar todas las materias únicas
  for (const materias of Object.values(gradosYMaterias)) {
    for (const materia of materias) {
      todasLasMaterias.add(materia);
    }
  }

  // Primero, asegurémonos de que existan los tipos de materia
  const tiposMateria = [
    { nombre: 'ACADEMICA', descripcion: 'Materias académicas regulares' },
    { nombre: 'HABITO', descripcion: 'Hábitos y comportamientos' },
    { nombre: 'EXTRACURRICULAR', descripcion: 'Actividades extracurriculares' },
    { nombre: 'HOGAR', descripcion: 'Responsabilidades en el hogar' }
  ];

  // Crear los tipos de materia si no existen
  for (const tipo of tiposMateria) {
    try {
      await prisma.tipoMateria.create({
        data: tipo
      });
      console.log(`Tipo de materia creado: ${tipo.nombre}`);
    } catch (error) {
      if (error.code === 'P2002') {
        console.log(`El tipo de materia ${tipo.nombre} ya existe`);
      } else {
        console.error('Error creando tipo de materia:', error);
        throw error;
      }
    }
  }

  // Mapear tipos de evaluación a tipos de materia
  const evaluacionATipoMateria = {
    'EXTRACURRICULAR': 'EXTRACURRICULAR',
    'COMPORTAMIENTO': 'HABITO',
    'APRENDIZAJE': 'ACADEMICA',
    'CASA': 'HOGAR'
  };

  // Crear las materias en la base de datos
  const materiasCreadas: Array<{id: string, nombre: string}> = [];
  let orden = 1;
  
  for (const nombreMateria of todasLasMaterias) {
    const tipo = getTipoEvaluacion(nombreMateria);
    
    // Crear la materia si no existe
    // Obtener el nombre del tipo de materia basado en el tipo de evaluación
    const nombreTipoMateria = evaluacionATipoMateria[tipo as keyof typeof evaluacionATipoMateria] || 'ACADEMICA';
    
    // Primero obtener el tipo de materia existente
    const tipoMateria = await prisma.tipoMateria.findUnique({
      where: { nombre: nombreTipoMateria }
    });

    if (!tipoMateria) {
      throw new Error(`No se encontró el tipo de materia: ${nombreTipoMateria}`);
    }

    const materia = await prisma.materia.upsert({
      where: { nombre: nombreMateria },
      update: {
        // Actualizar la relación si es necesario
        tipoMateriaId: tipoMateria.id
      },
      create: {
        nombre: nombreMateria,
        codigo: `MAT-${orden.toString().padStart(3, '0')}`,
        creditos: tipo === "EXTRACURRICULAR" ? 0 : 1,
        esExtracurricular: tipo === 'EXTRACURRICULAR',
        orden: orden++,
        tipoMateriaId: tipoMateria.id
      },
      include: {
        tipoMateria: true
      }
    });
    
    materiasCreadas.push(materia);
    
    // Crear la evaluación de hábito asociada si corresponde
    if (tipo !== 'EXTRACURRICULAR') {
      await prisma.evaluacionHabito.upsert({
        where: { 
          nombre_tipo: {
            nombre: nombreMateria,
            tipo: tipo as keyof typeof EvaluacionTipo
          }
        },
        update: {
          descripcion: `Evaluación de ${nombreMateria.toLowerCase()}`,
          orden: orden - 1,
          materia: { connect: { id: materia.id } }
        },
        create: {
          nombre: nombreMateria,
          tipo: tipo as keyof typeof EvaluacionTipo,
          descripcion: `Evaluación de ${nombreMateria.toLowerCase()}`,
          orden: orden - 1,
          materia: { connect: { id: materia.id } }
        }
      });
    }
  }
  
  console.log(`Se han creado ${materiasCreadas.length} materias y sus evaluaciones de hábito asociadas.`);
  
  console.log('Proceso de creación de materias completado.');
  
  // Verificar si ya existe un estudiante de prueba
  let estudiantePrueba = await prisma.student.findFirst({
    where: { 
      nombre: 'Estudiante',
      apellido: 'Prueba',
      dni: '1234567890101' // DNI de prueba
    }
  });

  // Si no existe, crearlo
  if (!estudiantePrueba) {
    estudiantePrueba = await prisma.student.create({
      data: {
        nombre: 'Estudiante',
        apellido: 'Prueba',
        dni: '1234567890101',
        fechaNacimiento: new Date('2000-01-01'),
        direccion: 'Dirección de prueba',
        telefono: '12345678',
        contactoEmergencia: 'Contacto de emergencia',
        telefonoEmergencia: '87654321',
        grados: grados,
        activo: true
      }
    });
  } else {
    // Si ya existe, actualizar sus grados
    estudiantePrueba = await prisma.student.update({
      where: { id: estudiantePrueba.id },
      data: {
        grados: grados,
        activo: true
      }
    });
  }
  
  console.log('Estudiante de prueba creado/actualizado con todos los grados.');


  // Crear usuario administrador si no existe
  const adminEmail = 'admin@example.com';
  const adminExists = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        nombre: 'Administrador',
        apellido: 'Sistema',
        rol: 'ADMIN',
        requiresPasswordChange: false,
        activo: true
      }
    });
  }

  console.log('Datos de seed creados exitosamente');
}

main()
  .catch((e) => {
    console.error('Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
