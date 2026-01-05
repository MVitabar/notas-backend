import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function probarEndpointCompleto() {
  try {
    console.log('🔍 Probando el endpoint completo...\n');

    const estudianteId = '5e3fc97d-cdac-4840-a4e2-846775e7ff99';
    const periodoId = '0c65ac7d-a1d4-4084-98c9-98d47cc64066';

    // Simular el proceso del método obtenerCalificacionesPorEstudiante
    
    // 1. Obtener calificaciones existentes
    const calificacionesExistentes = await prisma.calificacionHabito.findMany({
      where: {
        estudianteId,
        periodoId
      },
      include: {
        evaluacionHabito: true
      },
      orderBy: [
        { createdAt: 'desc' }
      ]
    });

    console.log(`📊 Calificaciones encontradas: ${calificacionesExistentes.length}`);

    // 2. Crear mapa de traducción
    const calificacionesPorEvaluacion = new Map<string, any[]>();
    const materiaIdAEvaluacionId = new Map<string, string>();
    
    for (const calificacion of calificacionesExistentes) {
      if (!calificacionesPorEvaluacion.has(calificacion.evaluacionHabitoId)) {
        calificacionesPorEvaluacion.set(calificacion.evaluacionHabitoId, []);
      }
      calificacionesPorEvaluacion.get(calificacion.evaluacionHabitoId)?.push(calificacion);
      
      if (calificacion.evaluacionHabito?.materiaId) {
        materiaIdAEvaluacionId.set(calificacion.evaluacionHabito.materiaId, calificacion.evaluacionHabitoId);
        console.log(`🔗 Mapeo: ${calificacion.evaluacionHabito.materiaId} -> ${calificacion.evaluacionHabitoId}`);
      }
    }

    // 3. Obtener materias de hábitos
    const materiasHabitos = await prisma.$queryRaw`
      SELECT 
        m.id,
        m.nombre,
        m.descripcion,
        m.tipo_materia_id as "tipoMateriaId",
        tm.nombre as "tipoMateriaNombre",
        tm.descripcion as "tipoMateriaDescripcion",
        m.es_extracurricular as "esExtracurricular",
        m.grados
      FROM "Materia" m
      LEFT JOIN "TipoMateria" tm ON m.tipo_materia_id = tm.id
      WHERE 
        m.activa = true 
        AND (
          m.tipo_materia_id IN ('e133dce1-bb77-4b05-bdcb-0dc5d4c5df19', '16b47d65-2cb9-4c2e-8779-9e2f5576d896')
          OR m.es_extracurricular = true
        )
        AND m.grados::text LIKE '%1° Primaria%'
      ORDER BY m.orden ASC, m.nombre ASC
    ` as any[];

    console.log(`\n📚 Materias de hábitos: ${materiasHabitos.length}`);

    // 4. Procesar la materia específica
    const materia = materiasHabitos.find(m => m.id === '29533795-3c19-4e93-a059-1c8d648a424d');
    
    if (materia) {
      console.log('\n🎯 Procesando materia:', materia.nombre);
      
      // Usar el mapa de traducción
      const evaluacionIdParaCalificaciones = materiaIdAEvaluacionId.get(materia.id) || materia.id;
      console.log('🔗 ID de evaluación para calificaciones:', evaluacionIdParaCalificaciones);
      
      const calificacionesMateria = calificacionesPorEvaluacion.get(evaluacionIdParaCalificaciones) || [];
      console.log('📊 Calificaciones encontradas:', calificacionesMateria.length);
      
      if (calificacionesMateria.length > 0) {
        const ultimaCalificacion = calificacionesMateria[0];
        console.log('✅ Última calificación:');
        console.log('  - ID:', ultimaCalificacion.id);
        console.log('  - u1:', ultimaCalificacion.u1);
        console.log('  - u2:', ultimaCalificacion.u2);
        console.log('  - u3:', ultimaCalificacion.u3);
        console.log('  - u4:', ultimaCalificacion.u4);
        console.log('  - comentario:', ultimaCalificacion.comentario);
        console.log('  - actualizada:', ultimaCalificacion.updatedAt);
        
        // Construir el objeto que se enviaría al frontend
        const resultado = {
          id: ultimaCalificacion.id,
          evaluacionHabitoId: evaluacionIdParaCalificaciones,
          nombre: materia.nombre,
          descripcion: materia.descripcion || `Evaluación de ${materia.nombre}`,
          tipo: 'CASA',
          tipoMateriaId: materia.tipoMateriaId,
          grados: materia.grados || [],
          u1: ultimaCalificacion.u1 || null,
          u2: ultimaCalificacion.u2 || null,
          u3: ultimaCalificacion.u3 || null,
          u4: ultimaCalificacion.u4 || null,
          comentario: ultimaCalificacion.comentario || null,
          createdAt: ultimaCalificacion.createdAt || null,
          updatedAt: ultimaCalificacion.updatedAt || null,
          calificaciones: calificacionesMateria,
          esMateria: true
        };
        
        console.log('\n📤 Objeto para frontend:');
        console.log('  - evaluacionHabitoId:', resultado.evaluacionHabitoId);
        console.log('  - nombre:', resultado.nombre);
        console.log('  - tipo:', resultado.tipo);
        console.log('  - tipoMateriaId:', resultado.tipoMateriaId);
        console.log('  - u1:', resultado.u1);
        console.log('  - calificaciones.length:', resultado.calificaciones.length);
      } else {
        console.log('❌ No se encontraron calificaciones para esta materia');
      }
    } else {
      console.log('❌ No se encontró la materia específica');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

probarEndpointCompleto();
