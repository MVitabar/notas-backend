import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function eliminarDuplicados() {
  try {
    console.log('🗑️ Eliminando evaluaciones duplicadas...\n');

    // IDs de las evaluaciones duplicadas (las que están en mayúsculas)
    const duplicados = [
      'c8fdbbf9-ed99-4980-bb12-453cc47ee8c0', // COMPLETA TRABAJOS A TIEMPO
      '6361a334-c847-46a1-9f1c-07996231ca49', // PARTICIPA EN ACTIVIDADES DE APRENDIZAJE
      '8f34df3f-4622-4259-b870-04141277b7ed', // PRÁCTICA DIARIMAENTE LO ESTUDIADO
      '7a5adc7a-0890-4255-af94-9df38a461bfe'  // Práctica diariamente lo estudiado
    ];

    for (const id of duplicados) {
      try {
        // Verificar si existe antes de eliminar
        const evaluacion = await prisma.evaluacionHabito.findUnique({
          where: { id },
          select: { nombre: true, tipo: true }
        });

        if (evaluacion) {
          // Eliminar calificaciones asociadas primero
          await prisma.calificacionHabito.deleteMany({
            where: { evaluacionHabitoId: id }
          });

          // Eliminar la evaluación
          await prisma.evaluacionHabito.delete({
            where: { id }
          });

          console.log(`✅ Eliminado: ${evaluacion.nombre} (${evaluacion.tipo})`);
        } else {
          console.log(`⚠️ No encontrada: ${id}`);
        }
      } catch (error) {
        console.error(`❌ Error eliminando ${id}:`, error);
      }
    }

    console.log('\n🎉 ¡Limpieza completada!\n');

    // Verificación final
    console.log('📋 Verificación final:');
    const restantes = await prisma.evaluacionHabito.findMany({
      where: {
        activo: true,
        tipo: {
          in: ['COMPORTAMIENTO', 'APRENDIZAJE', 'CASA']
        }
      },
      select: {
        id: true,
        nombre: true,
        tipo: true
      },
      orderBy: { nombre: 'asc' }
    });

    console.log(`\n📊 Total de evaluaciones regulares restantes: ${restantes.length}`);
    restantes.forEach(ev => {
      console.log(`   - ${ev.nombre} (${ev.tipo})`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

eliminarDuplicados();
