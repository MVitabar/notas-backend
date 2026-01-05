import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mapeo completo de todas las materias a sus grados correspondientes usando Map para evitar duplicados
const materiasGradosMap = new Map<string, string[]>([
  // === HÁBITOS Y EXTRACURRICULARES ===
  
  // Extracurriculares - Primaria
  ['Comprensión de Lectura', ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria']],
  ['Lógica Matemática', ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria']],
  ['Moral Cristiana', ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria']],
  
  // Extracurriculares - Básico
  ['PROGRAMA DE LECTURA', ['1° Básico', '2° Básico', '3° Básico']],
  ['MORAL CRISTIANA', ['1° Básico', '2° Básico', '3° Básico']],
  
  // Extracurriculares - PC
  ['PROGRAMA DE LECTURA', ['4° PC', '5° PC', '6° PC']],
  ['MORAL CRISTIANA', ['4° PC', '5° PC', '6° PC']],
  
  // Extracurriculares - BCL
  ['RAZONAMIENTO VERBAL', ['4° BCL', '5° BCL']],
  ['PROGRAMA DE LECTURA', ['4° BCL', '5° BCL']],
  ['MORAL CRISTIANA', ['4° BCL', '5° BCL']],
  
  // Hábitos - Primaria
  ['Llega a tiempo', ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria']],
  ['Viene preparado para aprender', ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria']],
  ['Termina tareas', ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria']],
  ['Lee diariamente en casa', ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria']],
  ['Atiende junta de padres y maestros', ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria']],
  ['Práctica matemáticas diariamente', ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria']],
  ['Práctica, vocabulario de inglés diariamente', ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria']],
  ['Respeta autoridad', ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria']],
  ['Interactúa bien con sus compañeros', ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria']],
  ['Respeta los derechos y propiedades de otros', ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria']],
  ['Demuestra control de sí mismo', ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria']],
  ['Acepta responsabilidad de sus acciones', ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria']],
  ['Completa trabajo / asignatura, a tiempo', ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria']],
  ['Regresa tareas terminadas y notas firmadas a tiempo', ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria']],
  ['Participa e interactúa en actividades de aprendizaje', ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria']],
  ['Práctica valores morales diariamente', ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria']],
  
  // Hábitos - Básico
  ['Respeta Autoridad', ['1° Básico', '2° Básico', '3° Básico']],
  ['Interactúa bien con sus compañeros', ['1° Básico', '2° Básico', '3° Básico']],
  ['Acepta Responsabilidad de sus acciones', ['1° Básico', '2° Básico', '3° Básico']],
  ['Práctica Valores Morales diariamente', ['1° Básico', '2° Básico', '3° Básico']],
  ['Responsable en Clase', ['1° Básico', '2° Básico', '3° Básico']],
  ['Completa Trabajos a Tiempo', ['1° Básico', '2° Básico', '3° Básico']],
  ['Participa en actividades de aprendizaje', ['1° Básico', '2° Básico', '3° Básico']],
  ['Llega a tiempo', ['1° Básico', '2° Básico', '3° Básico']],
  ['Atiende juntas de padres', ['1° Básico', '2° Básico', '3° Básico']],
  ['Práctica diariamente lo estudiado', ['1° Básico', '2° Básico', '3° Básico']],
  
  // Hábitos - PC
  ['RESPETA AUTORIDAD', ['4° PC', '5° PC', '6° PC']],
  ['INTERACTÚA BIEN CON SUS COMPAÑEROS', ['4° PC', '5° PC', '6° PC']],
  ['ACEPTA RESPONSABILIDAD DE SUS ACCIONES', ['4° PC', '5° PC', '6° PC']],
  ['PRÁCTICA VALORES MORALES DIARIAMENTE', ['4° PC', '5° PC', '6° PC']],
  ['RESPONSABLE EN CLASES', ['4° PC', '5° PC', '6° PC']],
  ['COMPLETA TRABAJOS A TIEMPO', ['4° PC', '5° PC', '6° PC']],
  ['PARTICIPA EN ACTIVIDADES DE APRENDIZAJE', ['4° PC', '5° PC', '6° PC']],
  ['LLEGA A TIEMPO', ['4° PC', '5° PC', '6° PC']],
  ['ATIENDE JUNTAS DE PADRES', ['4° PC', '5° PC', '6° PC']],
  ['PRÁCTICA DIARIMAENTE LO ESTUDIADO', ['4° PC', '5° PC', '6° PC']],
  ['Completa Trabajos a Tiempo', ['4° PC', '5° PC', '6° PC']],
  ['Práctica diariamente lo estudiado', ['4° PC', '5° PC', '6° PC']],
  
  // Hábitos - BCL
  ['RESPETA AUTORIDAD', ['4° BCL', '5° BCL']],
  ['INTERACTÚA BIEN CON SUS COMPAÑEROS', ['4° BCL', '5° BCL']],
  ['ACEPTA RESPONSABILIDAD DE SUS ACCIONES', ['4° BCL', '5° BCL']],
  ['PRÁCTICA VALORES MORALES DIARIAMENTE', ['4° BCL', '5° BCL']],
  ['RESPONSABLE EN CLASES', ['4° BCL', '5° BCL']],
  ['COMPLETA TRABAJOS A TIEMPO', ['4° BCL', '5° BCL']],
  ['PARTICIPA EN ACTIVIDADES DE APRENDIZAJE', ['4° BCL', '5° BCL']],
  ['LLEGA A TIEMPO', ['4° BCL', '5° BCL']],
  ['ATIENDE JUNTAS DE PADRES', ['4° BCL', '5° BCL']],
  ['PRÁCTICA DIARIMAENTE LO ESTUDIADO', ['4° BCL', '5° BCL']],
  
  // === MATERIAS ACADÉMICAS ===
  
  // Primaria (1°-3°)
  ['Idioma Materno', ['1° Primaria', '2° Primaria', '3° Primaria']],
  ['Tercer Idioma (Inglés)', ['1° Primaria', '2° Primaria', '3° Primaria']],
  ['Matemáticas', ['1° Primaria', '2° Primaria', '3° Primaria']],
  ['Medio Social', ['1° Primaria', '2° Primaria', '3° Primaria']],
  ['Medio Natural', ['1° Primaria', '2° Primaria', '3° Primaria']],
  ['Expresión Artística', ['1° Primaria', '2° Primaria', '3° Primaria']],
  ['Educación Física', ['1° Primaria', '2° Primaria', '3° Primaria']],
  ['Formación Ciudadana', ['1° Primaria', '2° Primaria', '3° Primaria']],
  ['Ortografía', ['1° Primaria', '2° Primaria', '3° Primaria']],
  ['Artes Plásticas', ['1° Primaria', '2° Primaria', '3° Primaria']],
  ['Computación', ['1° Primaria', '2° Primaria', '3° Primaria']],
  
  // Primaria (4°-6°)
  ['Idioma Materno', ['4° Primaria', '5° Primaria', '6° Primaria']],
  ['Tercer Idioma  Inglés', ['4° Primaria', '5° Primaria', '6° Primaria']],
  ['Matemáticas', ['4° Primaria', '5° Primaria', '6° Primaria']],
  ['Ciencias Sociales', ['4° Primaria', '5° Primaria', '6° Primaria']],
  ['Ciencias Naturales y Tecnología', ['4° Primaria', '5° Primaria', '6° Primaria']],
  ['Expresión Artística  Música', ['4° Primaria', '5° Primaria', '6° Primaria']],
  ['Educación Física', ['4° Primaria', '5° Primaria', '6° Primaria']],
  ['Formación Ciudadana', ['4° Primaria', '5° Primaria', '6° Primaria']],
  ['Productividad y Desarrollo', ['4° Primaria', '5° Primaria', '6° Primaria']],
  ['Ortografía', ['4° Primaria', '5° Primaria', '6° Primaria']],
  ['Artes plásticas', ['4° Primaria', '5° Primaria', '6° Primaria']],
  ['Computación', ['4° Primaria', '5° Primaria', '6° Primaria']],
  
  // Básico
  ['Matemáticas', ['1° Básico', '2° Básico', '3° Básico']],
  ['Culturas e Idiomas Mayas, Garífuna o Xinca', ['1° Básico', '2° Básico', '3° Básico']],
  ['Comunicación y Lenguaje, Idioma Español', ['1° Básico', '2° Básico', '3° Básico']],
  ['Comunicación y Lenguaje Idioma Extranjero', ['1° Básico', '2° Básico', '3° Básico']],
  ['Ciencias Naturales', ['1° Básico', '2° Básico', '3° Básico']],
  ['Ciencias Sociales, Formación Ciudadana e Interculturalidad', ['1° Básico', '2° Básico', '3° Básico']],
  ['Educación Musical', ['1° Básico', '2° Básico', '3° Básico']],
  ['Artes Visuales', ['1° Básico', '2° Básico', '3° Básico']],
  ['Teatro', ['1° Básico', '2° Básico', '3° Básico']],
  ['Danza', ['1° Básico', '2° Básico', '3° Básico']],
  ['Emprendimiento para la productividad', ['1° Básico', '2° Básico', '3° Básico']],
  ['Tecnologías del Aprendizaje y la Comunicación', ['1° Básico', '2° Básico', '3° Básico']],
  ['Educación Física', ['1° Básico', '2° Básico', '3° Básico']],
  
  // PC - 4° año
  ['CONTABILIDAD DE SOCIEDADES', ['4° PC']],
  ['MATEMÁTICA COMERCIAL', ['4° PC']],
  ['FUNDAMENTOS DE DERECHO', ['4° PC']],
  ['INGLÉS COMERCIAL', ['4° PC']],
  ['REDACCIÓN Y CORRESPONDENCIA MERCANTIL', ['4° PC']],
  ['INTRODUCCIÓN A LA ECONOMÍA', ['4° PC']],
  ['ORTOGRAFÍA Y CALIGRAFÍA', ['4° PC']],
  ['ADMINISTRACIÓN Y ORGANIZACIÓN DE OFICINA', ['4° PC']],
  ['COMPUTACIÓN', ['4° PC']],
  ['PROGRAMACIÓN', ['4° PC']],
  ['MATEMÁTICA BÁSICA', ['4° PC']],
  ['FÍSICA', ['4° PC']],
  ['MÉTODOS DE LA INVESTIGACIÓN', ['4° PC']],
  
  // PC - 5° año
  ['CONTABILIDAD DE COSTOS', ['5° PC']],
  ['CÁLCULO MERCANTIL Y FINANCIERO', ['5° PC']],
  ['INGLÉS COMERCIAL', ['5° PC']],
  ['LEGISLACIÓN FISCAL Y ADUANA', ['5° PC']],
  ['FINANZAS PÚBLICAS', ['5° PC']],
  ['GEOGRAFÍA ECONÓMICA', ['5° PC']],
  ['CATALOGACIÓN Y ARCHIVO', ['5° PC']],
  ['MECANOGRAFÍA', ['5° PC']],
  ['COMPUTACIÓN', ['5° PC']],
  ['PROGRAMACIÓN', ['5° PC']],
  ['MATEMÁTICA BÁSICA', ['5° PC']],
  ['QUÍMICA GENERAL', ['5° PC']],
  ['GESTIÓN DE PROYECTOS', ['5° PC']],
  
  // PC - 6° año
  ['CONTABILIDAD BANCARIA', ['6° PC']],
  ['CONTABILIDAD GUBERNAMENTAL', ['6° PC']],
  ['ESTADÍSTICA COMERCIAL', ['6° PC']],
  ['ORGANIZACIÓN DE EMPRESAS', ['6° PC']],
  ['ÉTICA PROFESIONAL Y R.H', ['6° PC']],
  ['PRÁCTICA SUPERVISADA', ['6° PC']],
  ['AUDITORÍA', ['6° PC']],
  ['DERECHO MERCANTIL Y N.D.L', ['6° PC']],
  ['COMPUTACIÓN', ['6° PC']],
  ['SEMINARIO', ['6° PC']],
  ['PROGRAMACIÓN', ['6° PC']],
  ['MATEMÁTICA BÁSICA', ['6° PC']],
  ['BIOLOGÍA GENERAL', ['6° PC']],
  
  // BCL - 4° y 5° año
  ['LENGUA Y LITERATURA', ['4° BCL', '5° BCL']],
  ['COMUNICACIÓN Y LENGUAJE L3 (INGLÉS TÉCNICO)', ['4° BCL', '5° BCL']],
  ['TICS', ['4° BCL', '5° BCL']],
  ['MATEMÁTICAS', ['4° BCL', '5° BCL']],
  ['FÍSICA', ['4° BCL', '5° BCL']],
  ['CIENCIAS SOCIALES Y FORMACIÓN CIUDADANA', ['4° BCL', '5° BCL']],
  ['PSICOLOGÍA', ['4° BCL', '5° BCL']],
  ['EDUCACIÓN FÍSICA', ['4° BCL', '5° BCL']],
  ['ELABORACIÓN Y GESTIÓN DE PROYECTOS', ['4° BCL', '5° BCL']],
  ['FILOSOFÍA', ['4° BCL', '5° BCL']],
  ['METODOLOGÍA DE LA INVESTIGACIÓN', ['4° BCL', '5° BCL']],
  ['RAZONAMIENTO MATEMÁTICO', ['4° BCL', '5° BCL']],
  
  // Materias universales (aplican a todos los grados)
  ['Expresión Artística', ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria', '1° Básico', '2° Básico', '3° Básico', '4° PC', '5° PC', '6° PC', '4° BCL', '5° BCL']],
  ['Educación Física', ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria', '1° Básico', '2° Básico', '3° Básico', '4° PC', '5° PC', '6° PC', '4° BCL', '5° BCL']],
  ['Computación', ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria', '4° PC', '5° PC', '6° PC']]
]);

async function asignarGradosCompletos() {
  console.log('🔧 Asignando grados a TODAS las materias...');
  
  try {
    // Obtener TODAS las materias activas
    const materias = await prisma.materia.findMany({
      where: { activa: true }
    });
    
    console.log(`📚 Procesando ${materias.length} materias totales...`);
    
    let actualizadas = 0;
    let noEncontradas = 0;
    
    for (const materia of materias) {
      let gradosAsignados: string[] = [];
      
      // Buscar los grados para esta materia
      if (materiasGradosMap.has(materia.nombre)) {
        gradosAsignados = materiasGradosMap.get(materia.nombre) || [];
      } else {
        // Si no está en el mapeo, asignar array vacío (requerirá asignación manual)
        gradosAsignados = [];
        noEncontradas++;
        console.log(`⚠️  No encontrada en mapeo: ${materia.nombre}`);
      }
      
      // Actualizar la materia usando raw SQL
      await prisma.$executeRaw`
        UPDATE "Materia" 
        SET "grados" = ${gradosAsignados}, "updatedAt" = NOW()
        WHERE "id" = ${materia.id}
      `;
      
      if (gradosAsignados.length > 0) {
        console.log(`✅ ${materia.nombre}: [${gradosAsignados.join(', ')}]`);
        actualizadas++;
      }
    }
    
    console.log(`\n🎉 Asignación completada!`);
    console.log(`✅ Materias actualizadas: ${actualizadas}`);
    console.log(`⚠️  Materias no encontradas en mapeo: ${noEncontradas}`);
    
    if (noEncontradas > 0) {
      console.log(`\n📝 Las ${noEncontradas} materias no encontradas necesitarán asignación manual.`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  asignarGradosCompletos();
}
