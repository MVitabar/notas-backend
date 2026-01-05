import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function verificarCalificacionGuardada() {
  try {
    console.log('🔍 Verificando calificación guardada...\n');

    const estudianteId = '5e3fc97d-cdac-4840-a4e2-846775e7ff99';
    const periodoId = '0c65ac7d-a1d4-4084-98c9-98d47cc64066';
    const evaluacionHabitoId = '29533795-3c19-4e93-a059-1c8d648a424d';

    console.log('📋 Parámetros de búsqueda:');
    console.log(`  - Estudiante ID: ${estudianteId}`);
    console.log(`  - Período ID: ${periodoId}`);
    console.log(`  - Evaluación ID: ${evaluacionHabitoId}`);

    // 1. Verificar si existe la evaluación
    const evaluacion = await prisma.evaluacionHabito.findUnique({
      where: { id: evaluacionHabitoId },
      select: {
        id: true,
        nombre: true,
        tipo: true,
        descripcion: true
      }
    });

    console.log('\n🎯 Evaluación encontrada:');
    console.log(`  - ID: ${evaluacion?.id}`);
    console.log(`  - Nombre: ${evaluacion?.nombre}`);
    console.log(`  - Tipo: ${evaluacion?.tipo}`);
    console.log(`  - Descripción: ${evaluacion?.descripcion}`);

    // 2. Buscar todas las calificaciones para esta combinación
    const calificaciones = await prisma.calificacionHabito.findMany({
      where: {
        estudianteId,
        periodoId,
        evaluacionHabitoId
      },
      include: {
        evaluacionHabito: {
          select: {
            id: true,
            nombre: true,
            tipo: true
          }
        },
        estudiante: {
          select: {
            id: true,
            nombre: true
          }
        },
        docente: {
          select: {
            id: true,
            nombre: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    console.log(`\n📊 Calificaciones encontradas: ${calificaciones.length}`);
    
    if (calificaciones.length > 0) {
      calificaciones.forEach((cal, index) => {
        console.log(`\n  ${index + 1}. Calificación ID: ${cal.id}`);
        console.log(`     u1: ${cal.u1}`);
        console.log(`     u2: ${cal.u2}`);
        console.log(`     u3: ${cal.u3}`);
        console.log(`     u4: ${cal.u4}`);
        console.log(`     comentario: ${cal.comentario}`);
        console.log(`     creada: ${cal.createdAt}`);
        console.log(`     actualizada: ${cal.updatedAt}`);
        console.log(`     docente: ${cal.docente?.nombre}`);
      });
    } else {
      console.log('❌ No se encontraron calificaciones para esta evaluación');
    }

    // 3. Verificar si es una materia
    const materia = await prisma.materia.findUnique({
      where: { id: evaluacionHabitoId },
      select: {
        id: true,
        nombre: true,
        tipoMateriaId: true,
        grados: true,
        esExtracurricular: true
      }
    });

    if (materia) {
      console.log('\n📚 Es una materia:');
      console.log(`  - ID: ${materia.id}`);
      console.log(`  - Nombre: ${materia.nombre}`);
      console.log(`  - tipoMateriaId: ${materia.tipoMateriaId}`);
      console.log(`  - esExtracurricular: ${materia.esExtracurricular}`);
      console.log(`  - grados: [${materia.grados?.join(', ')}]`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarCalificacionGuardada();
