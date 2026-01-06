import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verificacionFinalGrados() {
  console.log('🎯 VERIFICACIÓN FINAL - ASIGNACIÓN DE GRADOS');
  console.log('='.repeat(60));

  try {
    // 1. Contar materias con y sin grados
    const totalMaterias = await prisma.materia.count();
    const materiasConGrados = await prisma.materia.count({
      where: {
        grados: {
          not: []
        }
      }
    });
    const materiasSinGrados = totalMaterias - materiasConGrados;

    console.log(`\n📊 Estadísticas generales:`);
    console.log(`  📚 Total de materias: ${totalMaterias}`);
    console.log(`  ✅ Materias con grados asignados: ${materiasConGrados}`);
    console.log(`  ❌ Materias sin grados: ${materiasSinGrados}`);

    // 2. Mostrar distribución por nivel educativo
    const materias = await prisma.materia.findMany({
      select: {
        nombre: true,
        grados: true
      }
    });

    const distribucion: { [key: string]: number } = {
      '1° Primaria': 0,
      '2° Primaria': 0,
      '3° Primaria': 0,
      '4° Primaria': 0,
      '5° Primaria': 0,
      '6° Primaria': 0,
      '1° Básico': 0,
      '2° Básico': 0,
      '3° Básico': 0,
      '4° PC': 0,
      '5° PC': 0,
      '6° PC': 0,
      '4° BCL': 0,
      '5° BCL': 0
    };

    materias.forEach(materia => {
      materia.grados.forEach(grado => {
        if (distribucion[grado] !== undefined) {
          distribucion[grado]++;
        }
      });
    });

    console.log(`\n📈 Distribución por nivel educativo:`);
    Object.entries(distribucion).forEach(([grado, count]) => {
      console.log(`  📓 ${grado}: ${count} materias`);
    });

    // 3. Mostrar algunas materias de ejemplo por categoría
    console.log(`\n📋 Ejemplos de materias por nivel:`);

    const ejemplosPorNivel: { [key: string]: string[] } = {
      'Primaria': [],
      'Básico': [],
      'PC': [],
      'BCL': []
    };

    materias.forEach(materia => {
      if (materia.grados.some(g => g.includes('Primaria'))) {
        ejemplosPorNivel['Primaria'].push(materia.nombre);
      }
      if (materia.grados.some(g => g.includes('Básico'))) {
        ejemplosPorNivel['Básico'].push(materia.nombre);
      }
      if (materia.grados.some(g => g.includes('PC'))) {
        ejemplosPorNivel['PC'].push(materia.nombre);
      }
      if (materia.grados.some(g => g.includes('BCL'))) {
        ejemplosPorNivel['BCL'].push(materia.nombre);
      }
    });

    Object.entries(ejemplosPorNivel).forEach(([nivel, materiasLista]) => {
      console.log(`\n  🎓 ${nivel} (${materiasLista.length} materias):`);
      materiasLista.slice(0, 5).forEach(materia => {
        console.log(`    - ${materia}`);
      });
      if (materiasLista.length > 5) {
        console.log(`    ... y ${materiasLista.length - 5} más`);
      }
    });

    // 4. Verificar materias específicas importantes
    const materiasImportantes = [
      'Matemáticas',
      'Comunicación y Lenguaje, Idioma Español',
      'Ciencias Naturales',
      'Educación Física',
      'PROGRAMA DE LECTURA',
      'MORAL CRISTIANA',
      'Respeta autoridad',
      'Lee diariamente en casa'
    ];

    console.log(`\n🔍 Verificación de materias importantes:`);
    materiasImportantes.forEach(nombre => {
      const materia = materias.find(m => m.nombre === nombre);
      if (materia) {
        console.log(`  ✅ ${nombre}: [${materia.grados.join(', ')}]`);
      } else {
        console.log(`  ❌ ${nombre}: NO ENCONTRADA`);
      }
    });

    // 5. Resumen final
    console.log(`\n🎉 RESUMEN FINAL:`);
    console.log(`  ✅ ${materiasConGrados}/${totalMaterias} materias tienen grados asignados`);
    console.log(`  📊 ${((materiasConGrados / totalMaterias) * 100).toFixed(1)}% de cobertura`);
    
    if (materiasSinGrados === 0) {
      console.log(`  🚀 ¡Todas las materias tienen grados asignados!`);
    } else {
      console.log(`  ⚠️ Quedan ${materiasSinGrados} materias sin asignar`);
    }

  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificacionFinalGrados();
