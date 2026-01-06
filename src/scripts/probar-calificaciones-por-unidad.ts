import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function probarCalificacionesPorUnidad() {
  try {
    console.log('🧪 Probando creación de calificaciones por unidad...');

    // Datos de prueba (usando IDs válidos de la base de datos)
    const estudianteId = 'ad596873-05fe-4abc-adbe-9fe2fc2de4e4'; // estudiante1
    const materiaId = '01287dda-77f3-4753-846a-299f549803f3'; // Respeta autoridad
    const periodoId = 'a67785f4-259b-4901-940f-b7246317edd4'; // 2026-1 (si existe)
    const docenteId = '08d01b29-1adb-4bc7-92b7-f7a2dd60e166'; // profesor1
    const tipoEvaluacion = 'a67785f4-259b-4901-940f-b7246317edd4';

    // Verificar si ya existen calificaciones para este estudiante/materia/período
    const existentes = await prisma.calificacion.findMany({
      where: {
        estudianteId,
        materiaId,
        periodoId,
        tipoEvaluacion
      },
      select: {
        id: true,
        unidad: true,
        calificacion: true
      }
    });

    console.log(`📋 Calificaciones existentes: ${existentes.length}`);
    existentes.forEach(c => {
      console.log(`  - Unidad: ${c.unidad || 'N/A'}, Calificación: ${c.calificacion}`);
    });

    // Eliminar calificaciones existentes para la prueba
    if (existentes.length > 0) {
      console.log('🗑️ Eliminando calificaciones existentes...');
      await prisma.calificacion.deleteMany({
        where: {
          estudianteId,
          materiaId,
          periodoId,
          tipoEvaluacion
        }
      });
    }

    // Crear calificaciones para cada unidad con diferentes tipoEvaluacion
    const unidades = ['u1', 'u2', 'u3', 'u4'];
    const calificaciones = [85, 90, 78, 92];
    const tiposEvaluacion = ['eval-u1', 'eval-u2', 'eval-u3', 'eval-u4'];

    console.log('📝 Creando calificaciones por unidad...');
    
    for (let i = 0; i < unidades.length; i++) {
      try {
        const resultado = await prisma.calificacion.create({
          data: {
            estudianteId,
            materiaId,
            periodoId,
            docenteId,
            tipoEvaluacion: tiposEvaluacion[i],
            tipoCalificacion: 'NUMERICA',
            calificacion: calificaciones[i],
            unidad: unidades[i],
            fecha: new Date()
          }
        });

        console.log(`✅ Unidad ${unidades[i]}: Calificación ${calificaciones[i]} creada (ID: ${resultado.id})`);
      } catch (error) {
        console.error(`❌ Error al crear calificación para unidad ${unidades[i]}:`, error.message);
      }
    }

    // Verificar las calificaciones creadas
    const creadas = await prisma.calificacion.findMany({
      where: {
        estudianteId,
        materiaId,
        periodoId,
        tipoEvaluacion
      },
      orderBy: {
        unidad: 'asc'
      }
    });

    console.log(`\n📊 Total de calificaciones creadas: ${creadas.length}`);
    creadas.forEach(c => {
      console.log(`  - Unidad: ${c.unidad}, Calificación: ${c.calificacion}, ID: ${c.id}`);
    });

    // Calcular promedio
    if (creadas.length > 0) {
      const suma = creadas.reduce((acc, c) => acc + (c.calificacion || 0), 0);
      const promedio = suma / creadas.length;
      console.log(`\n📈 Promedio calculado: ${promedio.toFixed(2)}`);
    }

    console.log('\n✅ Prueba completada exitosamente!');

  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  } finally {
    await prisma.$disconnect();
  }
}

probarCalificacionesPorUnidad();
