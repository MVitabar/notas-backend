import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function corregirGradosProduccion() {
  console.log('🔧 Corrigiendo grados en producción...');

  try {
    // Mapeo de grados correctos basado en la base local
    const mapeoGrados: { [key: string]: string[] } = {
      // Materias Primaria (1°, 2°, 3°)
      'Medio Natural': ['1° Primaria', '2° Primaria', '3° Primaria'],
      'Medio Social': ['1° Primaria', '2° Primaria', '3° Primaria'],
      'Tercer Idioma (Inglés)': ['1° Primaria', '2° Primaria', '3° Primaria'],
      'Artes Plásticas': ['1° Primaria', '2° Primaria', '3° Primaria'],
      'Ortografía': ['4° Primaria', '5° Primaria', '6° Primaria'],
      'Idioma Materno': ['4° Primaria', '5° Primaria', '6° Primaria'],
      'Formación Ciudadana': ['4° Primaria', '5° Primaria', '6° Primaria'],
      'Expresión Artística': ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria', '1° Básico', '2° Básico', '3° Básico', '4° PC', '5° PC', '6° PC', '4° BCL', '5° BCL'],
      'Computación': ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria', '4° PC', '5° PC', '6° PC'],
      'Educación Física': ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria', '1° Básico', '2° Básico', '3° Básico', '4° PC', '5° PC', '6° PC', '4° BCL', '5° BCL'],
      
      // Materias Básico (1°, 2°, 3°)
      'Matemáticas': ['1° Básico', '2° Básico', '3° Básico'],
      'Comunicación y Lenguaje, Idioma Español': ['1° Básico', '2° Básico', '3° Básico'],
      'Ciencias Naturales': ['1° Básico', '2° Básico', '3° Básico'],
      'Ciencias Sociales, Formación Ciudadana e Interculturalidad': ['1° Básico', '2° Básico', '3° Básico'],
      'Culturas e Idiomas Mayas, Garífuna o Xinca': ['1° Básico', '2° Básico', '3° Básico'],
      'Comunicación y Lenguaje Idioma Extranjero': ['1° Básico', '2° Básico', '3° Básico'],
      'Emprendimiento para la productividad': ['1° Básico', '2° Básico', '3° Básico'],
      'Tecnologías del Aprendizaje y la Comunicación': ['1° Básico', '2° Básico', '3° Básico'],
      'Educación Musical': ['1° Básico', '2° Básico', '3° Básico'],
      'Teatro': ['1° Básico', '2° Básico', '3° Básico'],
      'Artes Visuales': ['1° Básico', '2° Básico', '3° Básico'],
      'Danza': ['1° Básico', '2° Básico', '3° Básico'],
      
      // Materias Primaria (4°, 5°, 6°)
      'Ciencias Sociales': ['4° Primaria', '5° Primaria', '6° Primaria'],
      'Ciencias Naturales y Tecnología': ['4° Primaria', '5° Primaria', '6° Primaria'],
      'Productividad y Desarrollo': ['4° Primaria', '5° Primaria', '6° Primaria'],
      
      // Materias PC (Perito Contador)
      'Expresión Artística (Música)': ['4° Primaria', '5° Primaria', '6° Primaria'],
      
      // Materias HOGAR
      'Práctica vocabulario de inglés diariamente': ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria'],
      'Lee diariamente en casa': ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria'],
      'Termina tareas': ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria'],
      'Viene preparado para aprender': ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria'],
      'Práctica matemáticas diariamente': ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria'],
      'Atiende junta de padres y maestros': ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria'],
      
      // Materias HABITO - Primaria
      'Demuestra control de sí mismo': ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria'],
      'Acepta responsabilidad de sus acciones': ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria'],
      'Respeta los derechos y propiedades de otros': ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria'],
      'Participa e interactúa en actividades de aprendizaje': ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria'],
      'Práctica valores morales diariamente': ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria'],
      'Regresa tareas terminadas y notas firmadas a tiempo': ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria'],
      'Completa trabajo / asignatura, a tiempo': ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria'],
      'Respeta autoridad': ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria'],
      
      // Materias HABITO - Básico
      'Interactúa bien con sus compañeros': ['1° Básico', '2° Básico', '3° Básico'],
      'Llega a tiempo': ['1° Básico', '2° Básico', '3° Básico'],
      'Acepta Responsabilidad de sus acciones': ['1° Básico', '2° Básico', '3° Básico'],
      'Práctica Valores Morales diariamente': ['1° Básico', '2° Básico', '3° Básico'],
      'Responsable en Clase': ['1° Básico', '2° Básico', '3° Básico'],
      'Atiende juntas de padres': ['1° Básico', '2° Básico', '3° Básico'],
      'Participa en actividades de aprendizaje': ['1° Básico', '2° Básico', '3° Básico'],
      'Respeta Autoridad': ['1° Básico', '2° Básico', '3° Básico'],
      
      // Materias HABITO - PC
      'Práctica diariamente lo estudiado': ['4° PC', '5° PC', '6° PC'],
      'Completa Trabajos a Tiempo': ['4° PC', '5° PC', '6° PC'],
      
      // Materias EXTRACURRICULAR
      'Comprensión de Lectura': ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria'],
      'Lógica Matemática': ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria'],
      'Moral Cristiana': ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria', '1° Básico', '2° Básico', '3° Básico', '4° PC', '5° PC', '6° PC'],
      'Programa de Lectura': ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria', '1° Básico', '2° Básico', '3° Básico', '4° PC', '5° PC', '6° PC'],
      'Razonamiento Verbal': ['4° Bachillerato en Ciencias y Letras', '5° Bachillerato en Ciencias y Letras'],
      
      // Materias especiales
      'Inglés': ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria', '1° Básico', '2° Básico', '3° Básico', '4° PC', '5° PC', '6° PC']
    };

    // Obtener todas las materias de producción
    const materiasProduccion = await prisma.materia.findMany({
      where: {
        activa: true
      },
      select: {
        id: true,
        nombre: true,
        grados: true
      }
    });

    console.log(`\n📊 Procesando ${materiasProduccion.length} materias...`);

    let actualizaciones = 0;
    let sinGrados = 0;

    for (const materia of materiasProduccion) {
      // Buscar en el mapeo (ignorando mayúsculas/minúsculas y espacios)
      const nombreNormalizado = materia.nombre.trim();
      let gradosCorrectos: string[] | null = null;

      // Buscar exacta
      if (mapeoGrados[nombreNormalizado]) {
        gradosCorrectos = mapeoGrados[nombreNormalizado];
      } else {
        // Buscar aproximada
        const clave = Object.keys(mapeoGrados).find(key => 
          key.toLowerCase().includes(nombreNormalizado.toLowerCase()) ||
          nombreNormalizado.toLowerCase().includes(key.toLowerCase())
        );
        if (clave) {
          gradosCorrectos = mapeoGrados[clave];
        }
      }

      if (gradosCorrectos && JSON.stringify(materia.grados) !== JSON.stringify(gradosCorrectos)) {
        console.log(`🔧 Actualizando: ${materia.nombre}`);
        console.log(`   Antes: [${materia.grados.join(', ')}]`);
        console.log(`   Después: [${gradosCorrectos.join(', ')}]`);
        
        await prisma.materia.update({
          where: { id: materia.id },
          data: { grados: gradosCorrectos }
        });
        
        actualizaciones++;
      } else if (!gradosCorrectos) {
        console.log(`⚠️  Sin mapeo: ${materia.nombre}`);
        sinGrados++;
      }
    }

    console.log('\n📊 Resumen de actualizaciones:');
    console.log(`  ✅ Materias actualizadas: ${actualizaciones}`);
    console.log(`  ⚠️  Materias sin mapeo: ${sinGrados}`);
    console.log(`  📚 Total procesadas: ${materiasProduccion.length}`);

    // Verificar algunas materias específicas que sabemos que están mal
    console.log('\n🔍 Verificación de materias específicas:');
    
    const verificaciones = [
      'Ciencias Sociales y Formación Ciudadana',
      'Psicología',
      'Matemática Comercial',
      'Tics'
    ];

    for (const nombre of verificaciones) {
      const materia = await prisma.materia.findFirst({
        where: { nombre },
        select: { id: true, nombre: true, grados: true }
      });
      
      if (materia) {
        console.log(`${materia.nombre}: [${materia.grados.join(', ')}]`);
      }
    }

    console.log('\n🎉 ¡Corrección de grados completada!');

  } catch (error) {
    console.error('❌ Error durante la corrección:', error);
  }
}

corregirGradosProduccion()
  .then(() => {
    console.log('\n🎉 Script ejecutado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error en la ejecución del script:', error);
    process.exit(1);
  });

export { corregirGradosProduccion };
