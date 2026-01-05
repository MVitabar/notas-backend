import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function verificarGuardadoReal() {
  try {
    console.log('🔍 Verificando si las calificaciones se están guardando...\n');

    const estudianteId = '5e3fc97d-cdac-4840-a4e2-846775e7ff99';
    const periodoId = '0c65ac7d-a1d4-4084-98c9-98d47cc64066';

    // IDs relevantes
    const materiaId = '29533795-3c19-4e93-a059-1c8d648a424d';
    const evaluacionId = 'f54e7bd4-dbf4-4c1b-ae5a-6959ac733fe6';

    console.log('📋 IDs relevantes:');
    console.log(`  - Materia ID: ${materiaId}`);
    console.log(`  - Evaluación ID: ${evaluacionId}`);

    // 1. Buscar calificaciones con ID de materia (lo que envía el frontend)
    console.log('\n🔍 Buscando calificaciones con ID de materia:');
    const calificacionesPorMateria = await prisma.calificacionHabito.findMany({
      where: {
        estudianteId,
        periodoId,
        evaluacionHabitoId: materiaId // ❌ Esto es incorrecto
      },
      select: {
        id: true,
        evaluacionHabitoId: true,
        u1: true,
        u2: true,
        u3: true,
        u4: true,
        comentario: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { updatedAt: 'desc' }
    });

    console.log(`  - Encontradas: ${calificacionesPorMateria.length}`);
    calificacionesPorMateria.forEach((cal, i) => {
      console.log(`    ${i+1}. ID: ${cal.id}, u1: ${cal.u1}, actualizada: ${cal.updatedAt}`);
    });

    // 2. Buscar calificaciones con ID de evaluación correcto
    console.log('\n🔍 Buscando calificaciones con ID de evaluación correcto:');
    const calificacionesPorEvaluacion = await prisma.calificacionHabito.findMany({
      where: {
        estudianteId,
        periodoId,
        evaluacionHabitoId: evaluacionId // ✅ Esto es correcto
      },
      select: {
        id: true,
        evaluacionHabitoId: true,
        u1: true,
        u2: true,
        u3: true,
        u4: true,
        comentario: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { updatedAt: 'desc' }
    });

    console.log(`  - Encontradas: ${calificacionesPorEvaluacion.length}`);
    calificacionesPorEvaluacion.forEach((cal, i) => {
      console.log(`    ${i+1}. ID: ${cal.id}, u1: ${cal.u1}, actualizada: ${cal.updatedAt}`);
    });

    // 3. Verificar todas las calificaciones del estudiante en este período
    console.log('\n📊 Todas las calificaciones del estudiante en este período:');
    const todasLasCalificaciones = await prisma.calificacionHabito.findMany({
      where: {
        estudianteId,
        periodoId
      },
      select: {
        id: true,
        evaluacionHabitoId: true,
        u1: true,
        u2: true,
        u3: true,
        u4: true,
        evaluacionHabito: {
          select: {
            nombre: true,
            tipo: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: 10
    });

    console.log(`  - Total: ${todasLasCalificaciones.length}`);
    todasLasCalificaciones.forEach((cal, i) => {
      console.log(`    ${i+1}. ${cal.evaluacionHabito?.nombre} (${cal.evaluacionHabito?.tipo}) - u1: ${cal.u1}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarGuardadoReal();
