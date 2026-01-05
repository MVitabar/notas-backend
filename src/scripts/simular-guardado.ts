import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function simularGuardado() {
  try {
    console.log('🔍 Simulando el proceso de guardado...\n');

    const estudianteId = '5e3fc97d-cdac-4840-a4e2-846775e7ff99';
    const periodoId = '0c65ac7d-a1d4-4084-98c9-98d47cc64066';
    const docenteId = '1'; // ID de docente temporal
    
    // Datos que envía el frontend
    const calificacion = {
      evaluacionHabitoId: '29533795-3c19-4e93-a059-1c8d648a424d', // ID de materia
      u1: 'DESTACA',
      comentario: 'Evaluación de hábito'
    };

    console.log('📋 Datos recibidos:');
    console.log('  - estudianteId:', estudianteId);
    console.log('  - periodoId:', periodoId);
    console.log('  - evaluacionHabitoId:', calificacion.evaluacionHabitoId);
    console.log('  - u1:', calificacion.u1);

    // 1. Verificar si es una materia
    console.log('\n🔍 Paso 1: Verificando si es una materia...');
    const materia = await prisma.materia.findUnique({
      where: { 
        id: calificacion.evaluacionHabitoId
      },
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        tipoMateria: {
          select: {
            id: true,
            nombre: true
          }
        },
        esExtracurricular: true
      }
    });

    if (materia) {
      console.log('✅ Materia encontrada:', materia.nombre);
      console.log('  - tipoMateriaId:', materia.tipoMateria?.id);
      console.log('  - esExtracurricular:', materia.esExtracurricular);
      
      // 2. Determinar tipo de evaluación
      let tipoEvaluacion: 'EXTRACURRICULAR' | 'CASA' | 'COMPORTAMIENTO' | 'APRENDIZAJE';
      if (materia.esExtracurricular) {
        tipoEvaluacion = 'EXTRACURRICULAR';
      } else if (materia.tipoMateria?.id === 'e133dce1-bb77-4b05-bdcb-0dc5d4c5df19') {
        tipoEvaluacion = 'CASA';
      } else if (materia.tipoMateria?.id === '16b47d65-2cb9-4c2e-8779-9e2f5576d896') {
        tipoEvaluacion = 'COMPORTAMIENTO';
      } else {
        tipoEvaluacion = 'APRENDIZAJE';
      }
      
      console.log('🎯 Tipo de evaluación determinado:', tipoEvaluacion);
      
      // 3. Buscar evaluación existente
      console.log('\n🔍 Paso 2: Buscando evaluación existente...');
      const evaluacion = await prisma.evaluacionHabito.findFirst({
        where: {
          nombre: materia.nombre,
          tipo: tipoEvaluacion
        },
        select: {
          id: true,
          nombre: true,
          tipo: true,
          descripcion: true
        }
      });

      if (evaluacion) {
        console.log('✅ Evaluación encontrada:', evaluacion.id);
        console.log('  - Nombre:', evaluacion.nombre);
        console.log('  - Tipo:', evaluacion.tipo);
        
        // 4. Buscar calificación existente
        console.log('\n🔍 Paso 3: Buscando calificación existente...');
        const calificacionExistente = await prisma.calificacionHabito.findFirst({
          where: {
            estudianteId,
            periodoId,
            evaluacionHabitoId: evaluacion.id,
            docenteId
          }
        });

        if (calificacionExistente) {
          console.log('✅ Calificación existente encontrada:', calificacionExistente.id);
          console.log('  - u1 actual:', calificacionExistente.u1);
          
          // Actualizar
          const actualizada = await prisma.calificacionHabito.update({
            where: { id: calificacionExistente.id },
            data: {
              u1: calificacion.u1,
              comentario: calificacion.comentario,
              updatedAt: new Date()
            }
          });
          
          console.log('✅ Calificación actualizada:', actualizada.id);
        } else {
          console.log('ℹ️ No existe calificación, creando nueva...');
          
          // Crear nueva
          const nueva = await prisma.calificacionHabito.create({
            data: {
              estudianteId,
              periodoId,
              evaluacionHabitoId: evaluacion.id,
              docenteId,
              u1: calificacion.u1,
              comentario: calificacion.comentario
            }
          });
          
          console.log('✅ Calificación creada:', nueva.id);
        }
      } else {
        console.log('❌ No se encontró evaluación para esta materia');
      }
    } else {
      console.log('❌ No se encontró materia con ese ID');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

simularGuardado();
