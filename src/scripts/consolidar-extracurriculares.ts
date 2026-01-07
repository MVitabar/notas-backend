import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function consolidarMateriasExtracurriculares() {
  console.log('🔧 Consolidando materias extracurriculares duplicadas...');

  try {
    // Mapeo de consolidación (nombre canónico -> lista de variantes)
    const consolidacion = {
      'Moral Cristiana': ['Moral Cristiana', 'MORAL CRISTIANA'],
      'Programa de Lectura': ['Programa de Lectura', 'PROGRAMA DE LECTURA'],
      'Razonamiento Verbal': ['Razonamiento Verbal', 'RAZONAMIENTO VERBAL']
    };

    for (const [nombreCanonico, variantes] of Object.entries(consolidacion)) {
      console.log(`\n📚 Procesando: ${nombreCanonico}`);
      
      // Encontrar todas las variantes
      const materias = await prisma.materia.findMany({
        where: {
          nombre: { in: variantes },
          esExtracurricular: true
        },
        select: {
          id: true,
          nombre: true,
          grados: true,
          activa: true,
          orden: true
        },
        orderBy: { orden: 'asc' } // La más antigua será la principal
      });

      if (materias.length <= 1) {
        console.log(`  ℹ️ No hay duplicados para ${nombreCanonico}`);
        continue;
      }

      console.log(`  🔍 Encontradas ${materias.length} variantes:`);
      materias.forEach(m => {
        console.log(`    - ${m.nombre} (ID: ${m.id}) - Grados: [${m.grados.join(', ')}]`);
      });

      // La primera materia (orden más bajo) será la principal
      const materiaPrincipal = materias[0];
      const materiasParaConsolidar = materias.slice(1);

      // Recolectar todos los grados únicos
      const todosGrados = new Set<string>();
      materias.forEach(m => m.grados.forEach(g => todosGrados.add(g)));

      // Actualizar la materia principal con todos los grados
      await prisma.materia.update({
        where: { id: materiaPrincipal.id },
        data: {
          grados: Array.from(todosGrados),
          nombre: nombreCanonico // Asegurar nombre canónico
        }
      });

      console.log(`  ✅ Materia principal actualizada: ${materiaPrincipal.nombre}`);
      console.log(`    Grados consolidados: [${Array.from(todosGrados).join(', ')}]`);

      // Eliminar las materias duplicadas
      for (const materiaEliminar of materiasParaConsolidar) {
        // Primero eliminar referencias en otras tablas
        await prisma.evaluacionHabito.deleteMany({
          where: { materiaId: materiaEliminar.id }
        });

        await prisma.userMateria.deleteMany({
          where: { materiaId: materiaEliminar.id }
        });

        // Eliminar la materia
        await prisma.materia.delete({
          where: { id: materiaEliminar.id }
        });

        console.log(`  🗑️ Eliminada: ${materiaEliminar.nombre} (ID: ${materiaEliminar.id})`);
      }
    }

    // Verificación final
    console.log('\n📊 VERIFICACIÓN FINAL');
    const extracurricularesFinales = await prisma.materia.findMany({
      where: { esExtracurricular: true },
      select: {
        id: true,
        nombre: true,
        grados: true,
        activa: true,
        orden: true
      },
      orderBy: { nombre: 'asc' }
    });

    console.log(`📋 Materias extracurriculares finales (${extracurricularesFinales.length}):`);
    extracurricularesFinales.forEach(materia => {
      console.log(`  - ${materia.nombre}`);
      console.log(`    ID: ${materia.id}`);
      console.log(`    Grados: [${materia.grados.join(', ')}]`);
      console.log(`    Activa: ${materia.activa ? '✅' : '❌'}`);
      console.log(`    Orden: ${materia.orden}`);
      console.log('');
    });

    console.log('🎉 Consolidación de materias extracurriculares completada!');

  } catch (error) {
    console.error('❌ Error durante la consolidación:', error);
  } finally {
    await prisma.$disconnect();
  }
}

consolidarMateriasExtracurriculares();
