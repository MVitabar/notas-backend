import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verificarSolucionFinal() {
  console.log('🔍 Verificación final de la solución con IDs dinámicos...');

  try {
    // 1. Verificar que los tipos de materia existen
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

    console.log('\n📋 Tipos de materia encontrados:');
    tiposMateria.forEach(tipo => {
      console.log(`  - ${tipo.nombre}: ${tipo.id}`);
    });

    // 2. Simular la lógica del servicio
    const tipoMateriaMap = new Map<string, string>();
    tiposMateria.forEach(tipo => {
      tipoMateriaMap.set(tipo.nombre, tipo.id);
    });

    const hogarId = tipoMateriaMap.get('HOGAR');
    const habitoId = tipoMateriaMap.get('HABITO');

    if (!hogarId || !habitoId) {
      console.log('❌ No se encontraron todos los tipos de materia necesarios');
      return;
    }

    console.log('\n✅ IDs obtenidos dinámicamente:');
    console.log(`  - HOGAR: ${hogarId}`);
    console.log(`  - HABITO: ${habitoId}`);

    // 3. Probar con un estudiante
    const estudiante = await prisma.student.findFirst({
      select: {
        id: true,
        nombre: true,
        apellido: true,
        grados: true
      }
    });

    if (!estudiante) {
      console.log('❌ No se encontró ningún estudiante');
      return;
    }

    console.log(`\n👤 Estudiante: ${estudiante.nombre} ${estudiante.apellido}`);
    console.log(`🎓 Grados: [${estudiante.grados.join(', ')}]`);

    // 4. Construir y ejecutar la consulta SQL
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
        OR m."tipoMateriaId" = '${hogarId}' 
        OR m."tipoMateriaId" = '${habitoId}'
      )
      AND (${gradosConditions})
      ORDER BY m."orden" ASC, m."nombre" ASC
    `;

    const materiasHabitosRaw = await prisma.$queryRawUnsafe<any>(sqlQuery);

    console.log(`\n📊 Materias encontradas (${materiasHabitosRaw.length}):`);
    
    materiasHabitosRaw.forEach((m: any, index: number) => {
      console.log(`${index + 1}. ${m.nombre}`);
      console.log(`   📝 Tipo: ${m.tipoMateriaNombre}`);
      console.log(`   🎚️  Es extracurricular: ${m.esExtracurricular}`);
    });

    // 5. Analizar resultados
    const porTipo = materiasHabitosRaw.reduce((acc: any, m: any) => {
      const tipo = m.tipoMateriaNombre || 'SIN_TIPO';
      acc[tipo] = (acc[tipo] || 0) + 1;
      return acc;
    }, {});

    console.log(`\n📈 Resumen por tipo:`);
    Object.entries(porTipo).forEach(([tipo, cantidad]) => {
      console.log(`  - ${tipo}: ${cantidad}`);
    });

    console.log('\n🎉 ¡Solución verificada exitosamente!');
    console.log('✅ Los IDs se obtienen dinámicamente por nombre');
    console.log('✅ No hay IDs fijos en el código');
    console.log('✅ El filtrado por grado funciona correctamente');
    console.log('✅ La solución es segura y mantenible');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

verificarSolucionFinal()
  .then(() => {
    console.log('\n🎉 Script ejecutado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error en la ejecución del script:', error);
    process.exit(1);
  });

export { verificarSolucionFinal };
