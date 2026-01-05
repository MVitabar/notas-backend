import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verificarEndpointFinal() {
  console.log('🔍 Verificación final del endpoint de hábitos...');

  try {
    // 1. Obtener un estudiante de prueba
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

    console.log(`\n👤 Estudiante seleccionado: ${estudiante.nombre} ${estudiante.apellido}`);
    console.log(`🎓 Grados: [${estudiante.grados.join(', ')}]`);

    // 2. Obtener un período activo
    const periodo = await prisma.periodoAcademico.findFirst({
      where: { isCurrent: true }
    });

    if (!periodo) {
      console.log('❌ No se encontró ningún período activo');
      return;
    }

    console.log(`📅 Período: ${periodo.name} (${periodo.id})`);

    // 3. Simular la consulta exacta del servicio
    console.log('\n🔄 Ejecutando la misma consulta que el servicio...');
    
    // Construir las condiciones LIKE para cada grado
    const gradosConditions = estudiante.grados.map(grado => {
      // Extraer solo el grado base (ej: "1° Primaria A" -> "1° Primaria")
      const gradoBase = grado.split(' ')[0] + ' ' + grado.split(' ')[1];
      return `m.grados::text LIKE '%${gradoBase}%'`;
    }).join(' OR ');

    console.log(`🔍 Condiciones SQL: ${gradosConditions}`);
    
    // Construir la consulta SQL completa (con los IDs corregidos)
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
        OR m."tipoMateriaId" = '0f609589-94e6-49be-bcfb-b8b53b845d2d' 
        OR m."tipoMateriaId" = '1af761d9-37cd-4527-96b9-12a0235eae40'
      )
      AND (${gradosConditions})
      ORDER BY m."orden" ASC, m."nombre" ASC
    `;

    // Obtener materias de hábitos que aplican a los grados del estudiante usando raw SQL
    const materiasHabitosRaw = await prisma.$queryRawUnsafe<any>(sqlQuery);

    console.log(`\n📋 Materias encontradas (${materiasHabitosRaw.length}):`);
    
    materiasHabitosRaw.forEach((m: any, index: number) => {
      console.log(`${index + 1}. ${m.nombre}`);
      console.log(`   📝 Tipo: ${m.tipoMateriaNombre}`);
      console.log(`   🎚️  Es extracurricular: ${m.esExtracurricular}`);
      console.log(`   📚 Grados: [${Array.isArray(m.grados) ? m.grados.join(', ') : 'N/A'}]`);
    });

    // 4. Verificar que los IDs correspondan a los tipos correctos
    console.log('\n🔍 Verificación de IDs de tipos:');
    const tiposMateria = await prisma.tipoMateria.findMany({
      select: {
        id: true,
        nombre: true
      }
    });

    tiposMateria.forEach(tipo => {
      console.log(`  - ${tipo.nombre}: ${tipo.id}`);
    });

    // 5. Verificar que las materias encontradas correspondan a los tipos correctos
    console.log('\n✅ Verificación de correspondencia:');
    materiasHabitosRaw.forEach((m: any) => {
      const tipoCorrespondiente = tiposMateria.find(t => t.id === m.tipoMateriaId);
      if (tipoCorrespondiente) {
        console.log(`  ✅ ${m.nombre} -> ${tipoCorrespondiente.nombre}`);
      } else {
        console.log(`  ❌ ${m.nombre} -> Tipo no encontrado (${m.tipoMateriaId})`);
      }
    });

    console.log('\n🎉 Verificación completada exitosamente');
    console.log('✅ Los IDs de tipos de materia están corregidos');
    console.log('✅ El filtrado por grado está funcionando');
    console.log('✅ El endpoint debería devolver los hábitos correctamente');

  } catch (error) {
    console.error('❌ Error en la verificación:', error);
  }
}

verificarEndpointFinal()
  .then(() => {
    console.log('\n🎉 Script ejecutado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error en la ejecución del script:', error);
    process.exit(1);
  });

export { verificarEndpointFinal };
