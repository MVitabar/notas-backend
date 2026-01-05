import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function verificarCalificacionesExistentes() {
  try {
    console.log('🔍 Verificando calificaciones existentes...\n');

    const estudianteId = '5e3fc97d-cdac-4840-a4e2-846775e7ff99';
    const periodoId = '0c65ac7d-a1d4-4084-98c9-98d47cc64066';
    const evaluacionId = 'f54e7bd4-dbf4-4c1b-ae5a-6959ac733fe6';

    console.log('📋 Parámetros de búsqueda:');
    console.log('  - estudianteId:', estudianteId);
    console.log('  - periodoId:', periodoId);
    console.log('  - evaluacionId:', evaluacionId);

    // 1. Buscar calificaciones sin filtrar por docenteId
    console.log('\n🔍 Paso 1: Buscando calificaciones (sin docenteId)...');
    const calificacionesSinDocente = await prisma.calificacionHabito.findMany({
      where: {
        estudianteId,
        periodoId,
        evaluacionHabitoId: evaluacionId
      },
      select: {
        id: true,
        evaluacionHabitoId: true,
        docenteId: true,
        u1: true,
        u2: true,
        u3: true,
        u4: true,
        comentario: true,
        createdAt: true,
        updatedAt: true
      }
    });

    console.log(`  - Encontradas: ${calificacionesSinDocente.length}`);
    calificacionesSinDocente.forEach((cal, i) => {
      console.log(`    ${i+1}. ID: ${cal.id}`);
      console.log(`       docenteId: ${cal.docenteId}`);
      console.log(`       u1: ${cal.u1}`);
      console.log(`       actualizada: ${cal.updatedAt}`);
    });

    // 2. Buscar todas las calificaciones del estudiante
    console.log('\n📊 Paso 2: Todas las calificaciones del estudiante...');
    const todasLasCalificaciones = await prisma.calificacionHabito.findMany({
      where: {
        estudianteId,
        periodoId
      },
      select: {
        id: true,
        evaluacionHabitoId: true,
        docenteId: true,
        u1: true,
        evaluacionHabito: {
          select: {
            nombre: true,
            tipo: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    console.log(`  - Total: ${todasLasCalificaciones.length}`);
    todasLasCalificaciones.forEach((cal, i) => {
      console.log(`    ${i+1}. ${cal.evaluacionHabito?.nombre} (${cal.evaluacionHabito?.tipo})`);
      console.log(`       ID: ${cal.id}`);
      console.log(`       docenteId: ${cal.docenteId}`);
      console.log(`       u1: ${cal.u1}`);
    });

    // 3. Verificar el docenteId correcto
    if (calificacionesSinDocente.length > 0) {
      const docenteIdCorrecto = calificacionesSinDocente[0].docenteId;
      console.log('\n🎯 DocenteId correcto encontrado:', docenteIdCorrecto);
      
      // Intentar actualizar con el docenteId correcto
      console.log('\n🔧 Intentando actualizar con docenteId correcto...');
      const actualizada = await prisma.calificacionHabito.update({
        where: { id: calificacionesSinDocente[0].id },
        data: {
          u1: 'DESTACA',
          comentario: 'Evaluación de hábito - Actualizada',
          updatedAt: new Date()
        }
      });
      
      console.log('✅ Calificación actualizada exitosamente:');
      console.log('  - ID:', actualizada.id);
      console.log('  - u1:', actualizada.u1);
      console.log('  - actualizada:', actualizada.updatedAt);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarCalificacionesExistentes();
