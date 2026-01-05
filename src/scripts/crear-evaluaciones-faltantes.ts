import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function crearEvaluacionesFaltantes() {
  try {
    console.log('🔧 Creando evaluaciones faltantes para materias de hábitos...\n');

    // 1. Obtener todas las materias de hábitos que no tienen evaluación
    const materiasHabitos = await prisma.materia.findMany({
      where: {
        activa: true,
        OR: [
          { tipoMateriaId: 'e133dce1-bb77-4b05-bdcb-0dc5d4c5df19' }, // HOGAR
          { tipoMateriaId: '16b47d65-2cb9-4c2e-8779-9e2f5576d896' }, // HABITO
          { esExtracurricular: true }
        ]
      },
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        tipoMateriaId: true,
        esExtracurricular: true
      },
      orderBy: { nombre: 'asc' }
    });

    console.log(`📚 Materias de hábitos encontradas: ${materiasHabitos.length}\n`);

    for (const materia of materiasHabitos) {
      // Verificar si ya existe una evaluación para esta materia
      const evaluacionExistente = await prisma.evaluacionHabito.findFirst({
        where: {
          OR: [
            { materiaId: materia.id },
            { nombre: materia.nombre }
          ],
          activo: true
        },
        select: { id: true, nombre: true }
      });

      if (!evaluacionExistente) {
        // Determinar el tipo de evaluación según el tipoMateria
        let tipoEvaluacion: 'EXTRACURRICULAR' | 'CASA' | 'COMPORTAMIENTO' | 'APRENDIZAJE';
        if (materia.esExtracurricular) {
          tipoEvaluacion = 'EXTRACURRICULAR';
        } else if (materia.tipoMateriaId === 'e133dce1-bb77-4b05-bdcb-0dc5d4c5df19') {
          tipoEvaluacion = 'CASA';
        } else if (materia.tipoMateriaId === '16b47d65-2cb9-4c2e-8779-9e2f5576d896') {
          tipoEvaluacion = 'COMPORTAMIENTO';
        } else {
          tipoEvaluacion = 'APRENDIZAJE';
        }

        // Crear la evaluación faltante
        const nuevaEvaluacion = await prisma.evaluacionHabito.create({
          data: {
            nombre: materia.nombre,
            descripcion: materia.descripcion || `Evaluación de ${materia.nombre}`,
            tipo: tipoEvaluacion,
            activo: true,
            orden: 999,
            materia: {
              connect: { id: materia.id }
            }
          }
        });

        console.log(`✅ Evaluación creada: ${materia.nombre}`);
        console.log(`   - ID: ${nuevaEvaluacion.id}`);
        console.log(`   - Tipo: ${tipoEvaluacion}`);
        console.log(`   - materiaId: ${materia.id}`);
        console.log('');
      } else {
        console.log(`⚠️ Ya existe evaluación para: ${materia.nombre} (ID: ${evaluacionExistente.id})`);
      }
    }

    console.log('\n🎉 ¡Proceso completado!\n');

    // Verificación final
    console.log('📋 Verificación final:');
    const evaluacionesCreadas = await prisma.evaluacionHabito.findMany({
      where: {
        activo: true,
        materiaId: { not: null }
      },
      select: {
        id: true,
        nombre: true,
        tipo: true,
        materia: {
          select: {
            nombre: true,
            tipoMateriaId: true
          }
        }
      },
      orderBy: { nombre: 'asc' }
    });

    console.log(`\n📊 Total de evaluaciones con materiaId: ${evaluacionesCreadas.length}`);
    evaluacionesCreadas.slice(0, 5).forEach(ev => {
      console.log(`  - ${ev.nombre} (${ev.tipo}) -> Materia: ${ev.materia?.nombre}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

crearEvaluacionesFaltantes();
