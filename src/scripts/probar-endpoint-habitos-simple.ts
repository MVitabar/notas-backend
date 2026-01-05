import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function probarEndpointHabitosSimple() {
  console.log('🧪 Probando endpoint de hábitos por estudiante (versión simple)...');

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

  // 3. Simular la lógica del servicio
  try {
    console.log('\n🔄 Simulando la lógica de filtrado...');
    
    // Construir las condiciones LIKE para cada grado
    const gradosConditions = estudiante.grados.map(grado => {
      // Extraer solo el grado base (ej: "1° Primaria A" -> "1° Primaria")
      const gradoBase = grado.split(' ')[0] + ' ' + grado.split(' ')[1];
      return `m.grados::text LIKE '%${gradoBase}%'`;
    }).join(' OR ');

    console.log(`🔍 Condiciones SQL: ${gradosConditions}`);
    
    // Construir la consulta SQL completa
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
        OR m."tipoMateriaId" = 'e133dce1-bb77-4b05-bdcb-0dc5d4c5df19' 
        OR m."tipoMateriaId" = '16b47d65-2cb9-4c2e-8779-9e2f5576d896'
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

    // 4. Analizar por tipo
    const porTipo = materiasHabitosRaw.reduce((acc: any, m: any) => {
      const tipo = m.tipoMateriaNombre || 'SIN_TIPO';
      acc[tipo] = (acc[tipo] || 0) + 1;
      return acc;
    }, {});

    console.log(`\n📈 Resumen por tipo:`);
    Object.entries(porTipo).forEach(([tipo, cantidad]) => {
      console.log(`  - ${tipo}: ${cantidad}`);
    });

    // 5. Verificar si hay alguna materia que no debería aparecer
    console.log(`\n🔍 Verificación de consistencia:`);
    const tieneGradosIncompatibles = materiasHabitosRaw.some((m: any) => {
      if (!Array.isArray(m.grados)) return false;
      
      const tieneGradoCompatible = estudiante.grados.some(gradoEst => {
        const gradoBaseEst = gradoEst.split(' ')[0] + ' ' + gradoEst.split(' ')[1];
        return m.grados.some((gradoMat: string) => {
          const gradoBaseMat = gradoMat.split(' ')[0] + ' ' + gradoMat.split(' ')[1];
          return gradoBaseMat === gradoBaseEst;
        });
      });
      
      return !tieneGradoCompatible;
    });

    if (tieneGradosIncompatibles) {
      console.log(`⚠️ Se encontraron materias con grados incompatibles`);
    } else {
      console.log(`✅ Todas las materias tienen grados compatibles`);
    }

  } catch (error) {
    console.error('❌ Error al probar:', error);
  }
}

probarEndpointHabitosSimple()
  .then(() => {
    console.log('\n🎉 Script ejecutado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error en la ejecución del script:', error);
    process.exit(1);
  });

export { probarEndpointHabitosSimple };
