import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function debugBusquedaCalificacion() {
  try {
    console.log('🔍 Depurando búsqueda de calificación...\n');

    const estudianteId = '5e3fc97d-cdac-4840-a4e2-846775e7ff99';
    const periodoId = '0c65ac7d-a1d4-4084-98c9-98d47cc64066';
    const docenteId = '7ef4ec53-0b57-4747-86c0-18438ccb9ff9';
    
    // IDs relevantes
    const materiaId = '29533795-3c19-4e93-a059-1c8d648a424d';
    const evaluacionId = 'f54e7bd4-dbf4-4c1b-ae5a-6959ac733fe6';

    console.log('📋 Parámetros:');
    console.log('  - estudianteId:', estudianteId);
    console.log('  - periodoId:', periodoId);
    console.log('  - docenteId:', docenteId);
    console.log('  - materiaId:', materiaId);
    console.log('  - evaluacionId:', evaluacionId);

    // 1. Buscar con evaluacionId (correcto)
    console.log('\n🔍 Paso 1: Buscando con evaluacionId CORRECTO...');
    const calificacionConEvaluacionId = await prisma.calificacionHabito.findFirst({
      where: {
        estudianteId,
        periodoId,
        evaluacionHabitoId: evaluacionId,
        docenteId
      }
    });

    console.log('  - Encontrada:', !!calificacionConEvaluacionId);
    if (calificacionConEvaluacionId) {
      console.log('  - ID:', calificacionConEvaluacionId.id);
      console.log('  - u1:', calificacionConEvaluacionId.u1);
    }

    // 2. Buscar con materiaId (incorrecto)
    console.log('\n🔍 Paso 2: Buscando con materiaId INCORRECTO...');
    const calificacionConMateriaId = await prisma.calificacionHabito.findFirst({
      where: {
        estudianteId,
        periodoId,
        evaluacionHabitoId: materiaId,
        docenteId
      }
    });

    console.log('  - Encontrada:', !!calificacionConMateriaId);
    if (calificacionConMateriaId) {
      console.log('  - ID:', calificacionConMateriaId.id);
      console.log('  - u1:', calificacionConMateriaId.u1);
    }

    // 3. Buscar todas las calificaciones del estudiante
    console.log('\n🔍 Paso 3: Todas las calificaciones del estudiante...');
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
            tipo: true,
            materiaId: true
          }
        }
      }
    });

    console.log('  - Total:', todasLasCalificaciones.length);
    todasLasCalificaciones.forEach((cal, i) => {
      console.log(`    ${i+1}. ${cal.evaluacionHabito?.nombre}`);
      console.log(`       evaluacionHabitoId: ${cal.evaluacionHabitoId}`);
      console.log(`       materiaId: ${cal.evaluacionHabito?.materiaId}`);
      console.log(`       docenteId: ${cal.docenteId}`);
      console.log(`       u1: ${cal.u1}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugBusquedaCalificacion();
