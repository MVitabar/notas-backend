import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function buscarEvaluacionDeMateria() {
  try {
    console.log('🔍 Buscando evaluación asociada a la materia...\n');

    const materiaId = '29533795-3c19-4e93-a059-1c8d648a424d';
    const estudianteId = '5e3fc97d-cdac-4840-a4e2-846775e7ff99';
    const periodoId = '0c65ac7d-a1d4-4084-98c9-98d47cc64066';

    // 1. Obtener información de la materia
    const materia = await prisma.materia.findUnique({
      where: { id: materiaId },
      select: {
        id: true,
        nombre: true,
        tipoMateriaId: true,
        esExtracurricular: true
      }
    });

    console.log('📚 Información de la materia:');
    console.log(`  - ID: ${materia?.id}`);
    console.log(`  - Nombre: ${materia?.nombre}`);
    console.log(`  - tipoMateriaId: ${materia?.tipoMateriaId}`);
    console.log(`  - esExtracurricular: ${materia?.esExtracurricular}`);

    // 2. Buscar si existe una evaluación para esta materia
    const evaluacion = await prisma.evaluacionHabito.findFirst({
      where: {
        materiaId: materiaId,
        activo: true
      },
      select: {
        id: true,
        nombre: true,
        tipo: true,
        descripcion: true,
        materiaId: true
      }
    });

    console.log('\n🎯 Evaluación asociada:');
    console.log(`  - ID: ${evaluacion?.id}`);
    console.log(`  - Nombre: ${evaluacion?.nombre}`);
    console.log(`  - Tipo: ${evaluacion?.tipo}`);
    console.log(`  - materiaId: ${evaluacion?.materiaId}`);

    // 3. Buscar evaluaciones por nombre (alternativa)
    const evaluacionPorNombre = await prisma.evaluacionHabito.findFirst({
      where: {
        nombre: materia?.nombre,
        activo: true
      },
      select: {
        id: true,
        nombre: true,
        tipo: true,
        descripcion: true
      }
    });

    console.log('\n🔍 Evaluación por nombre:');
    console.log(`  - ID: ${evaluacionPorNombre?.id}`);
    console.log(`  - Nombre: ${evaluacionPorNombre?.nombre}`);
    console.log(`  - Tipo: ${evaluacionPorNombre?.tipo}`);

    // 4. Si encontramos evaluación, buscar calificaciones
    if (evaluacionPorNombre) {
      const calificaciones = await prisma.calificacionHabito.findMany({
        where: {
          estudianteId,
          periodoId,
          evaluacionHabitoId: evaluacionPorNombre.id
        },
        orderBy: {
          updatedAt: 'desc'
        }
      });

      console.log(`\n📊 Calificaciones para evaluación por nombre: ${calificaciones.length}`);
      if (calificaciones.length > 0) {
        const ultima = calificaciones[0];
        console.log(`  - Última calificación:`);
        console.log(`    u1: ${ultima.u1}`);
        console.log(`    u2: ${ultima.u2}`);
        console.log(`    u3: ${ultima.u3}`);
        console.log(`    u4: ${ultima.u4}`);
        console.log(`    comentario: ${ultima.comentario}`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

buscarEvaluacionDeMateria();
