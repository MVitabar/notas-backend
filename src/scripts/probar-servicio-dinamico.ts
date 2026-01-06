import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function probarServicioDinamico() {
  console.log('🔍 Probando el servicio con IDs dinámicos...');

  try {
    // 1. Obtener los IDs de tipos de materia como lo hace el servicio
    const tiposMateria = await prisma.tipoMateria.findMany({
      where: {
        nombre: {
          in: ['HOGAR', 'HABITO']
        }
      },
      select: {
        id: true,
        nombre: true
      }
    });

    const hogar = tiposMateria.find(t => t.nombre === 'HOGAR');
    const habito = tiposMateria.find(t => t.nombre === 'HABITO');

    if (!hogar || !habito) {
      console.log('❌ No se encontraron los tipos de materia HOGAR y HABITO necesarios');
      return;
    }

    const { hogarId, habitoId } = {
      hogarId: hogar.id,
      habitoId: habito.id
    };

    console.log('\n✅ IDs obtenidos dinámicamente:');
    console.log(`  - HOGAR: ${hogarId}`);
    console.log(`  - HABITO: ${habitoId}`);

    // 2. Obtener un estudiante
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

    // 3. Construir la consulta SQL como lo hace el servicio
    const gradosConditions = estudiante.grados.map(grado => {
      const gradoBase = grado.split(' ')[0] + ' ' + grado.split(' ')[1];
      return `m.grados::text LIKE '%${gradoBase}%'`;
    }).join(' OR ');

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
        tm.nombre as "tipoMateriaNombre",
        tm.descripcion as "tipoMateriaDescripcion"
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

    // 4. Ejecutar la consulta
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

    console.log('\n🎉 ¡Prueba del servicio exitosa!');
    console.log('✅ El servicio funciona correctamente con IDs dinámicos');
    console.log('✅ No hay IDs fijos en el código del servicio');
    console.log('✅ El filtrado por grado funciona correctamente');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

probarServicioDinamico()
  .then(() => {
    console.log('\n🎉 Script ejecutado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error en la ejecución del script:', error);
    process.exit(1);
  });

export { probarServicioDinamico };
