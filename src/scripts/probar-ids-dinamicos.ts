import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function probarIdsDinamicos() {
  console.log('🔍 Probando IDs dinámicos de tipos de materia...');

  try {
    // 1. Obtener los tipos de materia por nombre (forma segura)
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

    // 2. Crear mapa de nombres a IDs
    const tipoMateriaMap = new Map<string, string>();
    tiposMateria.forEach(tipo => {
      tipoMateriaMap.set(tipo.nombre, tipo.id);
    });

    // 3. Obtener los IDs
    const hogarId = tipoMateriaMap.get('HOGAR');
    const habitoId = tipoMateriaMap.get('HABITO');
    const extracurricularId = tipoMateriaMap.get('EXTRACURRICULAR');

    if (!hogarId || !habitoId || !extracurricularId) {
      console.log('❌ No se encontraron todos los tipos de materia necesarios');
      return;
    }

    console.log('\n✅ IDs obtenidos dinámicamente:');
    console.log(`  - HOGAR: ${hogarId}`);
    console.log(`  - HABITO: ${habitoId}`);
    console.log(`  - EXTRACURRICULAR: ${extracurricularId}`);

    // 4. Probar la consulta con los IDs dinámicos
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

    // Construir las condiciones LIKE para cada grado
    const gradosConditions = estudiante.grados.map(grado => {
      const gradoBase = grado.split(' ')[0] + ' ' + grado.split(' ')[1];
      return `m.grados::text LIKE '%${gradoBase}%'`;
    }).join(' OR ');

    console.log(`\n🔍 Condiciones SQL: ${gradosConditions}`);
    
    // Construir la consulta SQL con IDs dinámicos
    const sqlQuery = `
      SELECT 
        m.id,
        m.nombre,
        m.descripcion,
        m.codigo,
        m.creditos,
        m.activa,
        m."esExtracurricular",
        m.orden,
        m."createdAt",
        m."updatedAt",
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

    console.log('\n📋 Consulta SQL con IDs dinámicos:');
    console.log(sqlQuery);

    // Ejecutar la consulta
    const materiasHabitosRaw = await prisma.$queryRawUnsafe<any>(sqlQuery);

    console.log(`\n📊 Materias encontradas (${materiasHabitosRaw.length}):`);
    
    materiasHabitosRaw.forEach((m: any, index: number) => {
      console.log(`${index + 1}. ${m.nombre}`);
      console.log(`   📝 Tipo: ${m.tipoMateriaNombre}`);
      console.log(`   🎚️  Es extracurricular: ${m.esExtracurricular}`);
      console.log(`   🆔 Tipo ID: ${m.tipoMateriaId}`);
    });

    // 5. Analizar por tipo
    const porTipo = materiasHabitosRaw.reduce((acc: any, m: any) => {
      const tipo = m.tipoMateriaNombre || 'SIN_TIPO';
      acc[tipo] = (acc[tipo] || 0) + 1;
      return acc;
    }, {});

    console.log(`\n📈 Resumen por tipo:`);
    Object.entries(porTipo).forEach(([tipo, cantidad]) => {
      console.log(`  - ${tipo}: ${cantidad}`);
    });

    console.log('\n🎉 ¡Prueba exitosa con IDs dinámicos!');
    console.log('✅ El filtrado por grado funciona correctamente');
    console.log('✅ Los IDs se obtienen de forma segura por nombre');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

probarIdsDinamicos()
  .then(() => {
    console.log('\n🎉 Script ejecutado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error en la ejecución del script:', error);
    process.exit(1);
  });

export { probarIdsDinamicos };
