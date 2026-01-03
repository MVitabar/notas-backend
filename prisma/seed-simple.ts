import { PrismaClient } from '@prisma/client';

// Definir manualmente los enums necesarios
const EvaluacionTipo = {
  EXTRACURRICULAR: 'EXTRACURRICULAR',
  COMPORTAMIENTO: 'COMPORTAMIENTO',
  APRENDIZAJE: 'APRENDIZAJE',
  CASA: 'CASA'
} as const;

// Definir las materias únicas (extraídas del seed original)
const materiasUnicas = [
  // Académicas
  "Comprensión de Lectura",
  "Lógica Matemática", 
  "Programa de Lectura",
  "Razonamiento Verbal",
  "Razonamiento Matemático",
  "Moral Cristiana",
  
  // Comportamiento
  "Respeta autoridad",
  "Interactúa bien con sus compañeros", 
  "Acepta responsabilidad",
  "Practica valores morales",
  "Responsable en clases",
  "Llega a tiempo",
  
  // Hábitos de casa
  "Viene preparado",
  "Termina tareas",
  "Lee diariamente",
  "Asiste a juntas",
  "Atiende juntas de padres",
  "Practica diariamente lo estudiado",
  
  // Aprendizaje
  "Practica matemáticas",
  "Practica vocabulario de inglés",
  "Completa trabajo a tiempo",
  "Completa trabajos a tiempo",
  "Regresa tareas firmadas",
  "Participa en actividades"
];

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

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed simplificado - Solo Materias y Tipos');

  // 1. Crear tipos de materia
  const tiposMateria = [
    { nombre: 'ACADEMICA', descripcion: 'Materias académicas regulares' },
    { nombre: 'HABITO', descripcion: 'Hábitos y comportamientos' },
    { nombre: 'EXTRACURRICULAR', descripcion: 'Actividades extracurriculares' },
    { nombre: 'HOGAR', descripcion: 'Responsabilidades en el hogar' }
  ];

  console.log('📋 Creando tipos de materia...');
  for (const tipo of tiposMateria) {
    try {
      await prisma.tipoMateria.create({
        data: tipo
      });
      console.log(`✅ Tipo de materia creado: ${tipo.nombre}`);
    } catch (error) {
      if (error.code === 'P2002') {
        console.log(`⚠️  El tipo de materia ${tipo.nombre} ya existe`);
      } else {
        console.error('❌ Error creando tipo de materia:', error);
        throw error;
      }
    }
  }

  // 2. Mapear tipos de evaluación a tipos de materia
  const evaluacionATipoMateria = {
    'EXTRACURRICULAR': 'EXTRACURRICULAR',
    'COMPORTAMIENTO': 'HABITO',
    'APRENDIZAJE': 'ACADEMICA',
    'CASA': 'HOGAR'
  };

  console.log('📚 Creando materias...');
  
  // 3. Crear las materias en la base de datos
  const materiasCreadas: Array<{id: string, nombre: string}> = [];
  let orden = 1;
  
  for (const nombreMateria of materiasUnicas) {
    const tipo = getTipoEvaluacion(nombreMateria);
    
    // Obtener el nombre del tipo de materia basado en el tipo de evaluación
    const nombreTipoMateria = evaluacionATipoMateria[tipo as keyof typeof evaluacionATipoMateria] || 'ACADEMICA';
    
    // Obtener el tipo de materia existente
    const tipoMateria = await prisma.tipoMateria.findUnique({
      where: { nombre: nombreTipoMateria }
    });

    if (!tipoMateria) {
      throw new Error(`No se encontró el tipo de materia: ${nombreTipoMateria}`);
    }

    const materia = await prisma.materia.upsert({
      where: { nombre: nombreMateria },
      update: {
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
    console.log(`✅ Materia creada: ${materia.nombre} (${materia.tipoMateria?.nombre})`);
  }
  
  console.log(`🎉 Se han creado ${materiasCreadas.length} materias.`);
  console.log('✅ Seed simplificado completado exitosamente');
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
