import { PrismaClient } from '@prisma/client';

// Definir manualmente los enums necesarios
const EvaluacionTipo = {
  EXTRACURRICULAR: 'EXTRACURRICULAR',
  COMPORTAMIENTO: 'COMPORTAMIENTO',
  APRENDIZAJE: 'APRENDIZAJE',
  CASA: 'CASA'
} as const;

// Definir las materias organizadas por grados y tipos
const materiasPorGrado = {
  // Primero a tercero de primaria
  'primaria-baja': {
    academicas: [
      "Idioma Materno",
      "Tercer Idioma (Inglés)",
      "Matemáticas",
      "Medio Social",
      "Medio Natural",
      "Expresión Artística",
      "Educación Física",
      "Formación Ciudadana",
      "Ortografía",
      "Artes Plásticas",
      "Moral Cristiana",
      "Computación"
    ],
    extracurriculares: [
      "Comprensión de Lectura",
      "Lógica Matemática"
    ],
    comportamiento: [
      "Respeta autoridad",
      "Interactúa bien con sus compañeros",
      "Respeta los derechos y propiedades de otros",
      "Demuestra control de sí mismo",
      "Acepta responsabilidad de sus acciones"
    ],
    casa: [
      "Llega a tiempo",
      "Viene preparado para aprender",
      "Termina tareas",
      "Lee diariamente en casa",
      "Atiende junta de padres y maestros",
      "Práctica matemáticas diariamente",
      "Práctica vocabulario de inglés diariamente"
    ],
    aprendizaje: [
      "Completa trabajo / asignatura, a tiempo",
      "Regresa tareas terminadas y notas firmadas a tiempo",
      "Participa e interactúa en actividades de aprendizaje",
      "Práctica valores morales diariamente"
    ]
  },

  // Cuarto a sexto de primaria
  'primaria-alta': {
    academicas: [
      "Idioma Materno",
      "Tercer Idioma (Inglés)",
      "Matemáticas",
      "Ciencias Sociales",
      "Ciencias Naturales y Tecnología",
      "Expresión Artística (Música)",
      "Educación Física",
      "Formación Ciudadana",
      "Productividad y Desarrollo",
      "Ortografía",
      "Artes Plásticas",
      "Moral Cristiana",
      "Computación"
    ],
    extracurriculares: [
      "Comprensión de Lectura",
      "Lógica Matemática"
    ],
    comportamiento: [
      "Respeta autoridad",
      "Interactúa bien con sus compañeros",
      "Respeta los derechos y propiedades de otros",
      "Demuestra control de sí mismo",
      "Acepta responsabilidad de sus acciones"
    ],
    casa: [
      "Llega a tiempo",
      "Viene preparado para aprender",
      "Termina tareas",
      "Lee diariamente en casa",
      "Atiende junta de padres y maestros",
      "Práctica matemáticas diariamente",
      "Práctica vocabulario de inglés diariamente"
    ],
    aprendizaje: [
      "Completa trabajo / asignatura, a tiempo",
      "Regresa tareas terminadas y notas firmadas a tiempo",
      "Participa e interactúa en actividades de aprendizaje",
      "Práctica valores morales diariamente"
    ]
  },

  // Primero a tercero básico
  'basico': {
    academicas: [
      "Matemáticas",
      "Culturas e Idiomas Mayas, Garífuna o Xinca",
      "Comunicación y Lenguaje, Idioma Español",
      "Comunicación y Lenguaje Idioma Extranjero",
      "Ciencias Naturales",
      "Ciencias Sociales, Formación Ciudadana e Interculturalidad",
      "Educación Musical",
      "Artes Visuales",
      "Teatro",
      "Danza",
      "Emprendimiento para la productividad",
      "Tecnologías del Aprendizaje y la Comunicación",
      "Educación Física"
    ],
    extracurriculares: [
      "Moral Cristiana",
      "Programa de Lectura"
    ],
    comportamiento: [
      "Respeta Autoridad",
      "Interactúa bien con sus compañeros",
      "Acepta Responsabilidad de sus acciones",
      "Práctica Valores Morales diariamente",
      "Responsable en Clase",
      "Llega a tiempo",
      "Atiende juntas de padres"
    ],
    casa: [],
    aprendizaje: [
      "Completa Trabajos a Tiempo",
      "Participa en actividades de aprendizaje",
      "Práctica diariamente lo estudiado"
    ]
  },

  // Cuarto Perito Contador
  'pc-cuarto': {
    academicas: [
      "CONTABILIDAD DE SOCIEDADES",
      "MATEMÁTICA COMERCIAL",
      "FUNDAMENTOS DE DERECHO",
      "INGLÉS COMERCIAL",
      "REDACCIÓN Y CORRESPONDENCIA MERCANTIL",
      "INTRODUCCIÓN A LA ECONOMÍA",
      "ORTOGRAFÍA Y CALIGRAFÍA",
      "ADMINISTRACIÓN Y ORGANIZACIÓN DE OFICINA",
      "COMPUTACIÓN",
      "PROGRAMACIÓN",
      "MATEMÁTICA BÁSICA",
      "FÍSICA",
      "MÉTODOS DE LA INVESTIGACIÓN"
    ],
    extracurriculares: [
      "PROGRAMA DE LECTURA",
      "MORAL CRISTIANA"
    ],
    comportamiento: [
      "RESPETA AUTORIDAD",
      "INTERACTÚA BIEN CON SUS COMPAÑEROS",
      "ACEPTA RESPONSABILIDAD DE SUS ACCIONES",
      "PRÁCTICA VALORES MORALES DIARIAMENTE",
      "RESPONSABLE EN CLASES",
      "LLEGA A TIEMPO",
      "ATIENDE JUNTAS DE PADRES"
    ],
    casa: [],
    aprendizaje: [
      "COMPLETA TRABAJOS A TIEMPO",
      "PARTICIPA EN ACTIVIDADES DE APRENDIZAJE",
      "PRÁCTICA DIARIMAENTE LO ESTUDIADO"
    ]
  },

  // Quinto Perito Contador
  'pc-quinto': {
    academicas: [
      "CONTABILIDAD DE COSTOS",
      "CÁLCULO MERCANTIL Y FINANCIERO",
      "INGLÉS COMERCIAL",
      "LEGISLACIÓN FISCAL Y ADUANA",
      "FINANZAS PÚBLICAS",
      "GEOGRAFÍA ECONÓMICA",
      "CATALOGACIÓN Y ARCHIVO",
      "MECANOGRAFÍA",
      "COMPUTACIÓN",
      "PROGRAMACIÓN",
      "MATEMÁTICA BÁSICA",
      "QUÍMICA GENERAL",
      "GESTIÓN DE PROYECTOS"
    ],
    extracurriculares: [
      "PROGRAMA DE LECTURA",
      "MORAL CRISTIANA"
    ],
    comportamiento: [
      "RESPETA AUTORIDAD",
      "INTERACTÚA BIEN CON SUS COMPAÑEROS",
      "ACEPTA RESPONSABILIDAD DE SUS ACCIONES",
      "PRÁCTICA VALORES MORALES DIARIAMENTE",
      "RESPONSABLE EN CLASES",
      "LLEGA A TIEMPO",
      "ATIENDE JUNTAS DE PADRES"
    ],
    casa: [],
    aprendizaje: [
      "COMPLETA TRABAJOS A TIEMPO",
      "PARTICIPA EN ACTIVIDADES DE APRENDIZAJE",
      "PRÁCTICA DIARIMAENTE LO ESTUDIADO"
    ]
  },

  // Cuarto y quinto Bachillerato en Ciencias y Letras
  'bcl': {
    academicas: [
      "LENGUA Y LITERATURA",
      "COMUNICACIÓN Y LENGUAJE L3 (INGLÉS TÉCNICO)",
      "TICS",
      "MATEMÁTICAS",
      "FÍSICA",
      "CIENCIAS SOCIALES Y FORMACIÓN CIUDADANA",
      "PSICOLOGÍA",
      "EDUCACIÓN FÍSICA",
      "ELABORACIÓN Y GESTIÓN DE PROYECTOS",
      "FILOSOFÍA",
      "METODOLOGÍA DE LA INVESTIGACIÓN",
      "RAZONAMIENTO MATEMÁTICO"
    ],
    extracurriculares: [
      "RAZONAMIENTO VERBAL",
      "PROGRAMA DE LECTURA",
      "MORAL CRISTIANA"
    ],
    comportamiento: [
      "RESPETA AUTORIDAD",
      "INTERACTÚA BIEN CON SUS COMPAÑEROS",
      "ACEPTA RESPONSABILIDAD DE SUS ACCIONES",
      "PRÁCTICA VALORES MORALES DIARIAMENTE",
      "RESPONSABLE EN CLASES",
      "LLEGA A TIEMPO",
      "ATIENDE JUNTAS DE PADRES"
    ],
    casa: [],
    aprendizaje: [
      "COMPLETA TRABAJOS A TIEMPO",
      "PARTICIPA EN ACTIVIDADES DE APRENDIZAJE",
      "PRÁCTICA DIARIMAENTE LO ESTUDIADO"
    ]
  },

  // Sexto Perito Contador
  'pc-sexto': {
    academicas: [
      "CONTABILIDAD BANCARIA",
      "CONTABILIDAD GUBERNAMENTAL",
      "ESTADÍSTICA COMERCIAL",
      "ORGANIZACIÓN DE EMPRESAS",
      "ÉTICA PROFESIONAL Y R.H",
      "PRÁCTICA SUPERVISADA",
      "AUDITORÍA",
      "DERECHO MERCANTIL Y N.D.L",
      "COMPUTACIÓN",
      "SEMINARIO",
      "PROGRAMACIÓN",
      "MATEMÁTICA BÁSICA",
      "BIOLOGÍA GENERAL"
    ],
    extracurriculares: [
      "PROGRAMA DE LECTURA",
      "MORAL CRISTIANA"
    ],
    comportamiento: [
      "RESPETA AUTORIDAD",
      "INTERACTÚA BIEN CON SUS COMPAÑEROS",
      "ACEPTA RESPONSABILIDAD DE SUS ACCIONES",
      "PRÁCTICA VALORES MORALES DIARIAMENTE",
      "RESPONSABLE EN CLASES",
      "LLEGA A TIEMPO",
      "ATIENDE JUNTAS DE PADRES"
    ],
    casa: [],
    aprendizaje: [
      "COMPLETA TRABAJOS A TIEMPO",
      "PARTICIPA EN ACTIVIDADES DE APRENDIZAJE",
      "PRÁCTICA DIARIMAENTE LO ESTUDIADO"
    ]
  }
};

// Recolectar todas las materias únicas de todos los grados
const todasLasMaterias = new Set<string>();
const materiaTipoMap: Record<string, string> = {};

// Mapear tipos de evaluación a tipos de materia
const evaluacionATipoMateria = {
  'EXTRACURRICULAR': 'EXTRACURRICULAR',
  'COMPORTAMIENTO': 'HABITO',
  'APRENDIZAJE': 'ACADEMICA',
  'CASA': 'HOGAR'
};

// Recolectar materias y asignar tipos
for (const [grado, categorias] of Object.entries(materiasPorGrado)) {
  for (const [categoria, materias] of Object.entries(categorias)) {
    for (const materia of materias) {
      todasLasMaterias.add(materia);
      
      // Asignar tipo basado en la categoría
      if (categoria === 'academicas') {
        materiaTipoMap[materia] = 'ACADEMICA';  // Materias académicas van a tipo ACADEMICA
      } else if (categoria === 'extracurriculares') {
        materiaTipoMap[materia] = 'EXTRACURRICULAR';
      } else if (categoria === 'comportamiento') {
        materiaTipoMap[materia] = 'HABITO';  // Comportamiento va a tipo HABITO
      } else if (categoria === 'casa') {
        materiaTipoMap[materia] = 'HOGAR';    // Casa va a tipo HOGAR
      } else if (categoria === 'aprendizaje') {
        materiaTipoMap[materia] = 'ACADEMICA'; // Aprendizaje también va a ACADEMICA
      }
    }
  }
}

// Función para obtener el tipo de evaluación basado en el nombre
function getTipoEvaluacion(nombre: string): string {
  return materiaTipoMap[nombre] || 'ACADEMICA';
}

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed simplificado - Materias Organizadas por Grado y Tipo');

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

  console.log('📚 Creando materias organizadas por grados...');
  
  // 2. Crear las materias en la base de datos
  const materiasCreadas: Array<{id: string, nombre: string, tipo: string}> = [];
  let orden = 1;
  
  // Contadores para mostrar estadísticas
  let contadorAcademicas = 0;
  let contadorExtracurriculares = 0;
  let contadorComportamiento = 0;
  let contadorCasa = 0;
  let contadorAprendizaje = 0;
  
  for (const nombreMateria of todasLasMaterias) {
    const tipo = getTipoEvaluacion(nombreMateria);
    
    // Obtener el nombre del tipo de materia basado en el tipo de evaluación
    const nombreTipoMateria = materiaTipoMap[nombreMateria] || 'ACADEMICA';
    
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
        creditos: nombreTipoMateria === 'EXTRACURRICULAR' ? 0 : 1,
        esExtracurricular: nombreTipoMateria === 'EXTRACURRICULAR',
        orden: orden++,
        tipoMateriaId: tipoMateria.id
      },
      include: {
        tipoMateria: true
      }
    });
    
    materiasCreadas.push({...materia, tipo});
    
    // Contar por tipo para estadísticas
    if (nombreTipoMateria === 'ACADEMICA') {
      contadorAcademicas++;
    } else if (nombreTipoMateria === 'EXTRACURRICULAR') {
      contadorExtracurriculares++;
    } else if (nombreTipoMateria === 'HABITO') {
      contadorComportamiento++;
    } else if (nombreTipoMateria === 'HOGAR') {
      contadorCasa++;
    }
    
    console.log(`✅ Materia creada: ${materia.nombre} (${materia.tipoMateria?.nombre})`);
  }
  
  // Mostrar estadísticas finales
  console.log('\n📊 ESTADÍSTICAS DE MATERIAS CREADAS:');
  console.log(`📚 Áreas Académicas: ${contadorAcademicas}`);
  console.log(`🎯 Áreas Extracurriculares: ${contadorExtracurriculares}`);
  console.log(`🤝 Comportamiento: ${contadorComportamiento}`);
  console.log(`🏠 Hábitos en Casa: ${contadorCasa}`);
  console.log(`🎉 TOTAL: ${materiasCreadas.length} materias`);
  
  // Mostrar resumen por grados
  console.log('\n📓 RESUMEN POR GRADOS:');
  for (const [grado, categorias] of Object.entries(materiasPorGrado)) {
    let totalGrado = 0;
    console.log(`\n📖 ${grado.toUpperCase()}:`);
    
    for (const [categoria, materias] of Object.entries(categorias)) {
      if (materias.length > 0) {
        console.log(`   ${categoria}: ${materias.length} materias`);
        totalGrado += materias.length;
      }
    }
    console.log(`   Total: ${totalGrado} materias`);
  }
  
  console.log('\n✅ Seed simplificado completado exitosamente');
  console.log('🎯 Materias organizadas por grados y tipos listas para usar');
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
