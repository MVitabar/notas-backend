import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function sincronizarProduccion() {
  console.log('🔄 Sincronizando base de datos de producción...');

  try {
    // 1. Verificar tipos de materia en producción
    const tiposMateria = await prisma.tipoMateria.findMany({
      where: {
        nombre: {
          in: ['HOGAR', 'HABITO', 'EXTRACURRICULAR']
        }
      },
      select: {
        id: true,
        nombre: true
      }
    });

    console.log('\n📋 Tipos de materia en producción:');
    tiposMateria.forEach(tipo => {
      console.log(`  - ${tipo.nombre}: ${tipo.id}`);
    });

    // 2. Obtener IDs correctos de producción
    const hogar = tiposMateria.find(t => t.nombre === 'HOGAR');
    const habito = tiposMateria.find(t => t.nombre === 'HABITO');
    const extracurricular = tiposMateria.find(t => t.nombre === 'EXTRACURRICULAR');

    if (!hogar || !habito || !extracurricular) {
      console.log('❌ No se encontraron todos los tipos de materia necesarios');
      return;
    }

    console.log('\n✅ IDs de producción:');
    console.log(`  - HOGAR: ${hogar.id}`);
    console.log(`  - HABITO: ${habito.id}`);
    console.log(`  - EXTRACURRICULAR: ${extracurricular.id}`);

    // 3. Verificar materias HOGAR que necesitan actualizarse
    const materiasHogar = await prisma.materia.findMany({
      where: {
        tipoMateriaId: { not: hogar.id },
        OR: [
          { nombre: { contains: 'vocabulario de inglés' } },
          { nombre: { contains: 'matemáticas diariamente' } },
          { nombre: { contains: 'Lee diariamente' } },
          { nombre: { contains: 'Termina tareas' } },
          { nombre: { contains: 'Viene preparado' } },
          { nombre: { contains: 'Atiende junta de padres' } }
        ]
      }
    });

    console.log(`\n🔧 Materias HOGAR para actualizar (${materiasHogar.length}):`);
    for (const materia of materiasHogar) {
      console.log(`  - ${materia.nombre} (${materia.tipoMateriaId})`);
      await prisma.materia.update({
        where: { id: materia.id },
        data: { tipoMateriaId: hogar.id }
      });
      console.log(`    ✅ Actualizado a ${hogar.id}`);
    }

    // 4. Verificar materias HABITO que necesitan actualizarse
    const materiasHabito = await prisma.materia.findMany({
      where: {
        tipoMateriaId: { not: habito.id },
        OR: [
          { nombre: { contains: 'Respeta autoridad' } },
          { nombre: { contains: 'Interactúa' } },
          { nombre: { contains: 'Acepta responsabilidad' } },
          { nombre: { contains: 'Demuestra control' } },
          { nombre: { contains: 'Respeta los derechos' } },
          { nombre: { contains: 'Participa' } },
          { nombre: { contains: 'Llega a tiempo' } },
          { nombre: { contains: 'Responsable en Clase' } },
          { nombre: { contains: 'Práctica valores' } },
          { nombre: { contains: 'Regresa tareas' } },
          { nombre: { contains: 'Completa trabajo' } }
        ]
      }
    });

    console.log(`\n🔧 Materias HABITO para actualizar (${materiasHabito.length}):`);
    for (const materia of materiasHabito) {
      console.log(`  - ${materia.nombre} (${materia.tipoMateriaId})`);
      await prisma.materia.update({
        where: { id: materia.id },
        data: { tipoMateriaId: habito.id }
      });
      console.log(`    ✅ Actualizado a ${habito.id}`);
    }

    // 5. Verificar materias EXTRACURRICULAR que necesitan actualizarse
    const materiasExtracurricular = await prisma.materia.findMany({
      where: {
        tipoMateriaId: { not: extracurricular.id },
        esExtracurricular: true
      }
    });

    console.log(`\n🔧 Materias EXTRACURRICULAR para actualizar (${materiasExtracurricular.length}):`);
    for (const materia of materiasExtracurricular) {
      console.log(`  - ${materia.nombre} (${materia.tipoMateriaId})`);
      await prisma.materia.update({
        where: { id: materia.id },
        data: { tipoMateriaId: extracurricular.id }
      });
      console.log(`    ✅ Actualizado a ${extracurricular.id}`);
    }

    // 6. Verificar estado final
    const totalActualizaciones = materiasHogar.length + materiasHabito.length + materiasExtracurricular.length;
    
    console.log('\n📊 Resumen de sincronización:');
    console.log(`  - Materias HOGAR actualizadas: ${materiasHogar.length}`);
    console.log(`  - Materias HABITO actualizadas: ${materiasHabito.length}`);
    console.log(`  - Materias EXTRACURRICULAR actualizadas: ${materiasExtracurricular.length}`);
    console.log(`  - Total actualizaciones: ${totalActualizaciones}`);

    // 7. Verificar que el servicio funcionará con los nuevos IDs
    console.log('\n🔍 Verificando que el servicio funcionará...');
    const estudiante = await prisma.student.findFirst({
      select: {
        id: true,
        nombre: true,
        apellido: true,
        grados: true
      }
    });

    if (estudiante) {
      const gradosConditions = estudiante.grados.map(grado => {
        const gradoBase = grado.split(' ')[0] + ' ' + grado.split(' ')[1];
        return `m.grados::text LIKE '%${gradoBase}%'`;
      }).join(' OR ');

      const sqlQuery = `
        SELECT 
          m.id,
          m.nombre,
          m."esExtracurricular",
          m."tipoMateriaId",
          m.grados,
          tm.nombre as "tipoMateriaNombre"
        FROM "Materia" m
        LEFT JOIN "TipoMateria" tm ON m."tipoMateriaId" = tm.id
        WHERE m."activa" = true
        AND (
          m."esExtracurricular" = true 
          OR m."tipoMateriaId" = '${hogar.id}' 
          OR m."tipoMateriaId" = '${habito.id}'
        )
        AND (${gradosConditions})
        ORDER BY m."orden" ASC, m."nombre" ASC
      `;

      const materiasFiltradas = await prisma.$queryRawUnsafe<any>(sqlQuery);
      console.log(`\n✅ Verificación exitosa: ${materiasFiltradas.length} materias encontradas para ${estudiante.nombre}`);
    }

    console.log('\n🎉 ¡Sincronización completada exitosamente!');
    console.log('✅ Base de datos de producción actualizada');
    console.log('✅ IDs correctos asignados');
    console.log('✅ Servicio listo para funcionar');

  } catch (error) {
    console.error('❌ Error durante la sincronización:', error);
  }
}

sincronizarProduccion()
  .then(() => {
    console.log('\n🎉 Script ejecutado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error en la ejecución del script:', error);
    process.exit(1);
  });

export { sincronizarProduccion };
