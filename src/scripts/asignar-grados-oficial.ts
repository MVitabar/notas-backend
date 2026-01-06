import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function asignarGradosOficial() {
  console.log('🔧 Asignando grados según currículo oficial...');

  try {
    // Mapeo exacto según el currículo proporcionado
    const materiasGradosMap: { [key: string]: string[] } = {
      // === PRIMERO A TERCERO PRIMARIA ===
      
      // Áreas Académicas
      'Idioma Materno': ['1° Primaria', '2° Primaria', '3° Primaria'],
      'Tercer Idioma (Inglés)': ['1° Primaria', '2° Primaria', '3° Primaria'],
      'Matemáticas': ['1° Primaria', '2° Primaria', '3° Primaria'],
      'Medio Social': ['1° Primaria', '2° Primaria', '3° Primaria'],
      'Medio Natural': ['1° Primaria', '2° Primaria', '3° Primaria'],
      'Expresión Artística': ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria'],
      'Educación Física': ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria'],
      'Formación Ciudadana': ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria'],
      'Ortografía': ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria'],
      'Artes Plásticas': ['1° Primaria', '2° Primaria', '3° Primaria'],
      'Moral Cristiana': ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria'],
      'Computación': ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria'],
      
      // Áreas Extracurriculares (1-3 primaria)
      'Comprensión de Lectura': ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria'],
      'Lógica Matemática': ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria'],
      
      // Responsabilidades del estudiante con su comportamiento (1-3 primaria)
      'Respeta autoridad': ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria'],
      'Interactúa bien con sus compañeros': ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria'],
      'Respeta los derechos y propiedades de otros': ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria'],
      'Demuestra control de sí mismo': ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria'],
      'Acepta responsabilidad de sus acciones': ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria'],
      
      // Hábitos Practicados en casa (1-3 primaria)
      'Llega a tiempo': ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria'],
      'Viene preparado para aprender': ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria'],
      'Termina tareas': ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria'],
      'Lee diariamente en casa': ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria'],
      'Atiende junta de padres y maestros': ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria'],
      'Práctica matemáticas diariamente': ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria'],
      'Práctica vocabulario de inglés diariamente': ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria'],
      
      // Responsabilidad del estudiante con su aprendizaje (1-3 primaria)
      'Completa trabajo / asignatura, a tiempo': ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria'],
      'Regresa tareas terminadas y notas firmadas a tiempo': ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria'],
      'Participa e interactúa en actividades de aprendizaje': ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria'],
      'Práctica valores morales diariamente': ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria'],
      
      // === CUARTO A SEXTO PRIMARIA ===
      
      // Áreas Académicas (4-6 primaria)
      'Ciencias Sociales': ['4° Primaria', '5° Primaria', '6° Primaria'],
      'Ciencias Naturales y Tecnología': ['4° Primaria', '5° Primaria', '6° Primaria'],
      'Expresión Artística (Música)': ['4° Primaria', '5° Primaria', '6° Primaria'],
      'Productividad y Desarrollo': ['4° Primaria', '5° Primaria', '6° Primaria'],
      
      // === PRIMERO A TERCERO BÁSICO ===
      
      // Áreas y Sub áreas
      'Culturas e Idiomas Mayas, Garífuna o Xinca': ['1° Básico', '2° Básico', '3° Básico'],
      'Comunicación y Lenguaje, Idioma Español': ['1° Básico', '2° Básico', '3° Básico'],
      'Comunicación y Lenguaje Idioma Extranjero': ['1° Básico', '2° Básico', '3° Básico'],
      'Ciencias Naturales': ['1° Básico', '2° Básico', '3° Básico'],
      'Ciencias Sociales, Formación Ciudadana e Interculturalidad': ['1° Básico', '2° Básico', '3° Básico'],
      'Educación Musical': ['1° Básico', '2° Básico', '3° Básico'],
      'Artes Visuales': ['1° Básico', '2° Básico', '3° Básico'],
      'Teatro': ['1° Básico', '2° Básico', '3° Básico'],
      'Danza': ['1° Básico', '2° Básico', '3° Básico'],
      'Emprendimiento para la productividad': ['1° Básico', '2° Básico', '3° Básico'],
      'Tecnologías del Aprendizaje y la Comunicación': ['1° Básico', '2° Básico', '3° Básico'],
      
      // Áreas Educativas Extracurriculares (Básico)
      'PROGRAMA DE LECTURA': ['1° Básico', '2° Básico', '3° Básico', '4° PC', '5° PC', '6° PC', '4° BCL', '5° BCL'],
      'MORAL CRISTIANA': ['1° Básico', '2° Básico', '3° Básico', '4° PC', '5° PC', '6° PC', '4° BCL', '5° BCL'],
      
      // Responsabilidad del Estudiante (Básico)
      'Respeta Autoridad': ['1° Básico', '2° Básico', '3° Básico'],
      'Acepta Responsabilidad de sus acciones': ['1° Básico', '2° Básico', '3° Básico'],
      'Práctica Valores Morales diariamente': ['1° Básico', '2° Básico', '3° Básico'],
      'Responsable en Clase': ['1° Básico', '2° Básico', '3° Básico'],
      'Completa Trabajos a Tiempo': ['1° Básico', '2° Básico', '3° Básico'],
      'Participa en actividades de aprendizaje': ['1° Básico', '2° Básico', '3° Básico'],
      'Atiende juntas de padres': ['1° Básico', '2° Básico', '3° Básico'],
      'Práctica diariamente lo estudiado': ['1° Básico', '2° Básico', '3° Básico'],
      
      // === CUARTO PC ===
      
      // Areas Academicas
      'CONTABILIDAD DE SOCIEDADES': ['4° PC', '5° PC', '6° PC'],
      'MATEMÁTICA COMERCIAL': ['4° PC', '5° PC', '6° PC'],
      'FUNDAMENTOS DE DERECHO': ['4° PC', '5° PC', '6° PC'],
      'INGLÉS COMERCIAL': ['4° PC', '5° PC', '6° PC'],
      'REDACCIÓN Y CORRESPONDENCIA MERCANTIL': ['4° PC', '5° PC', '6° PC'],
      'INTRODUCCIÓN A LA ECONOMÍA': ['4° PC', '5° PC', '6° PC'],
      'ORTOGRAFÍA Y CALIGRAFÍA': ['4° PC', '5° PC', '6° PC'],
      'ADMINISTRACIÓN Y ORGANIZACIÓN DE OFICINA': ['4° PC', '5° PC', '6° PC'],
      'PROGRAMACIÓN': ['4° PC', '5° PC', '6° PC'],
      'MATEMÁTICA BÁSICA': ['4° PC', '5° PC', '6° PC'],
      'FÍSICA': ['4° PC', '5° PC', '6° PC'],
      'MÉTODOS DE LA INVESTIGACIÓN': ['4° PC', '5° PC', '6° PC'],
      
      // === QUINTO PC ===
      
      // Areas Academicas
      'CONTABILIDAD DE COSTOS': ['4° PC', '5° PC', '6° PC'],
      'CÁLCULO MERCANTIL Y FINANCIERO': ['4° PC', '5° PC', '6° PC'],
      'LEGISLACIÓN FISCAL Y ADUANA': ['4° PC', '5° PC', '6° PC'],
      'FINANZAS PÚBLICAS': ['4° PC', '5° PC', '6° PC'],
      'GEOGRAFÍA ECONÓMICA': ['4° PC', '5° PC', '6° PC'],
      'CATALOGACIÓN Y ARCHIVO': ['4° PC', '5° PC', '6° PC'],
      'MECANOGRAFÍA': ['4° PC', '5° PC', '6° PC'],
      'QUÍMICA GENERAL': ['4° PC', '5° PC', '6° PC'],
      'GESTIÓN DE PROYECTOS': ['4° PC', '5° PC', '6° PC'],
      
      // === CUARTO Y QUINTO BCL ===
      
      // Areas Academicas
      'LENGUA Y LITERATURA': ['4° BCL', '5° BCL'],
      'COMUNICACIÓN Y LENGUAJE L3 (INGLÉS TÉCNICO)': ['4° BCL', '5° BCL'],
      'TICS': ['4° BCL', '5° BCL'],
      'PSICOLOGÍA': ['4° BCL', '5° BCL'],
      'EDUCACIÓN FÍSICA': ['4° BCL', '5° BCL'],
      'ELABORACIÓN Y GESTIÓN DE PROYECTOS': ['4° BCL', '5° BCL'],
      'FILOSOFÍA': ['4° BCL', '5° BCL'],
      'METODOLOGÍA DE LA INVESTIGACIÓN': ['4° BCL', '5° BCL'],
      'RAZONAMIENTO MATEMÁTICO': ['4° BCL', '5° BCL'],
      
      // Áreas Académicas Extracurriculares (BCL)
      'RAZONAMIENTO VERBAL': ['4° BCL', '5° BCL'],
      
      // === SEXTO PC ===
      
      // Areas Academicas
      'CONTABILIDAD BANCARIA': ['4° PC', '5° PC', '6° PC'],
      'CONTABILIDAD GUBERNAMENTAL': ['4° PC', '5° PC', '6° PC'],
      'ESTADÍSTICA COMERCIAL': ['4° PC', '5° PC', '6° PC'],
      'ORGANIZACIÓN DE EMPRESAS': ['4° PC', '5° PC', '6° PC'],
      'ÉTICA PROFESIONAL Y R.H': ['4° PC', '5° PC', '6° PC'],
      'PRÁCTICA SUPERVISADA': ['4° PC', '5° PC', '6° PC'],
      'AUDITORÍA': ['4° PC', '5° PC', '6° PC'],
      'DERECHO MERCANTIL Y N.D.L': ['4° PC', '5° PC', '6° PC'],
      'SEMINARIO': ['4° PC', '5° PC', '6° PC'],
      'BIOLOGÍA GENERAL': ['4° PC', '5° PC', '6° PC'],
      
      // === RESPONSABILIDADES DEL ESTUDIANTE (PC y BCL) ===
      'RESPETA AUTORIDAD': ['4° PC', '5° PC', '6° PC', '4° BCL', '5° BCL'],
      'INTERACTÚA BIEN CON SUS COMPAÑEROS': ['4° PC', '5° PC', '6° PC', '4° BCL', '5° BCL'],
      'ACEPTA RESPONSABILIDAD DE SUS ACCIONES': ['4° PC', '5° PC', '6° PC', '4° BCL', '5° BCL'],
      'PRÁCTICA VALORES MORALES DIARIAMENTE': ['4° PC', '5° PC', '6° PC', '4° BCL', '5° BCL'],
      'RESPONSABLE EN CLASES': ['4° PC', '5° PC', '6° PC', '4° BCL', '5° BCL'],
      'COMPLETA TRABAJOS A TIEMPO': ['4° PC', '5° PC', '6° PC', '4° BCL', '5° BCL'],
      'PARTICIPA EN ACTIVIDADES DE APRENDIZAJE': ['4° PC', '5° PC', '6° PC', '4° BCL', '5° BCL'],
      'LLEGA A TIEMPO': ['4° PC', '5° PC', '6° PC', '4° BCL', '5° BCL'],
      'ATIENDE JUNTAS DE PADRES': ['4° PC', '5° PC', '6° PC', '4° BCL', '5° BCL'],
      'PRÁCTICA DIARIMAENTE LO ESTUDIADO': ['4° PC', '5° PC', '6° PC', '4° BCL', '5° BCL'],
      
      // === ESPECIALES ===
      'Biología': ['4° BCL', '5° BCL']
    };

    // Obtener todas las materias
    const materias = await prisma.materia.findMany({
      select: {
        id: true,
        nombre: true,
        grados: true
      }
    });

    console.log(`📚 Total de materias encontradas: ${materias.length}`);

    let actualizadas = 0;
    let noEncontradas = 0;

    for (const materia of materias) {
      const gradosAsignar = materiasGradosMap[materia.nombre];
      
      if (gradosAsignar) {
        await prisma.materia.update({
          where: { id: materia.id },
          data: {
            grados: gradosAsignar
          }
        });
        console.log(`✅ ${materia.nombre}: [${gradosAsignar.join(', ')}]`);
        actualizadas++;
      } else {
        console.log(`⚠️ No encontrada en mapeo: ${materia.nombre}`);
        noEncontradas++;
      }
    }

    console.log(`\n📊 Resumen:`);
    console.log(`✅ Materias actualizadas: ${actualizadas}`);
    console.log(`⚠️ Materias no encontradas en mapeo: ${noEncontradas}`);
    console.log(`📈 Total procesadas: ${materias.length}`);

    // Mostrar las materias que no se encontraron
    if (noEncontradas > 0) {
      console.log(`\n📝 Las ${noEncontradas} materias no encontradas necesitarán asignación manual:`);
      const noMapeadas = materias.filter(m => !materiasGradosMap[m.nombre]);
      noMapeadas.forEach(m => {
        console.log(`  - ${m.nombre}`);
      });
    }

    console.log('\n🎉 Asignación de grados completada!');

  } catch (error) {
    console.error('❌ Error durante la asignación de grados:', error);
  } finally {
    await prisma.$disconnect();
  }
}

asignarGradosOficial();
