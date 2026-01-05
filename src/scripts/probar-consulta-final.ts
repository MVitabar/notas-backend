import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function probarConsultaFinal() {
  console.log('🔍 Probando consulta SQL final con IDs correctos...');

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

    // 2. Construir las condiciones LIKE para cada grado
    const gradosConditions = estudiante.grados.map(grado => {
      // Extraer solo el grado base (ej: "1° Primaria A" -> "1° Primaria")
      const gradoBase = grado.split(' ')[0] + ' ' + grado.split(' ')[1];
      return `m.grados::text LIKE '%${gradoBase}%'`;
    }).join(' OR ');

    console.log(`\n🔍 Condiciones SQL: ${gradosConditions}`);
    
    // 3. Construir la consulta SQL completa con IDs correctos
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
        OR m."tipoMateriaId" = 'e133dce1-bb77-4b05-bdcb-0dc5d4c5df19' 
        OR m."tipoMateriaId" = '16b47d65-2cb9-4c2e-8779-9e2f5576d896'
      )
      AND (${gradosConditions})
      ORDER BY m."orden" ASC, m."nombre" ASC
    `;

    console.log('\n📋 Consulta SQL completa:');
    console.log(sqlQuery);

    // 4. Ejecutar la consulta
    const materiasHabitosRaw = await prisma.$queryRawUnsafe<any>(sqlQuery);

    console.log(`\n📊 Materias encontradas (${materiasHabitosRaw.length}):`);
    
    materiasHabitosRaw.forEach((m: any, index: number) => {
      console.log(`${index + 1}. ${m.nombre}`);
      console.log(`   📝 Tipo: ${m.tipoMateriaNombre}`);
      console.log(`   🎚️  Es extracurricular: ${m.esExtracurricular}`);
      console.log(`   📚 Grados: [${Array.isArray(m.grados) ? m.grados.join(', ') : 'N/A'}]`);
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

    // 6. Verificar si hay materias que deberían estar pero no están
    console.log('\n🔍 Verificación de materias esperadas vs encontradas:');
    
    const todasLasMaterias = await prisma.materia.findMany({
      where: {
        activa: true,
        OR: [
          { esExtracurricular: true },
          { tipoMateriaId: 'e133dce1-bb77-4b05-bdcb-0dc5d4c5df19' },
          { tipoMateriaId: '16b47d65-2cb9-4c2e-8779-9e2f5576d896' }
        ]
      },
      select: {
        id: true,
        nombre: true,
        tipoMateriaId: true,
        grados: true,
        tipoMateria: {
          select: { nombre: true }
        }
      }
    });

    console.log(`\n📚 Todas las materias de hábitos en la base de datos: ${todasLasMaterias.length}`);
    
    todasLasMaterias.forEach(materia => {
      if (Array.isArray(materia.grados)) {
        const tieneGradoCompatible = estudiante.grados.some(gradoEst => {
          const gradoBaseEst = gradoEst.split(' ')[0] + ' ' + gradoEst.split(' ')[1];
          return materia.grados.some((gradoMat: string) => {
            const gradoBaseMat = gradoMat.split(' ')[0] + ' ' + gradoMat.split(' ')[1];
            return gradoBaseMat === gradoBaseEst;
          });
        });

        if (tieneGradoCompatible) {
          const fueEncontrada = materiasHabitosRaw.some(m => m.id === materia.id);
          console.log(`  ${fueEncontrada ? '✅' : '❌'} ${materia.nombre} (${materia.tipoMateria?.nombre})`);
          if (!fueEncontrada) {
            console.log(`    ⚠️ Debería aparecer pero no fue encontrada`);
            console.log(`    📚 Grados materia: [${materia.grados.join(', ')}]`);
            console.log(`    🆔 Tipo ID: ${materia.tipoMateriaId}`);
          }
        }
      }
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

probarConsultaFinal()
  .then(() => {
    console.log('\n🎉 Script ejecutado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error en la ejecución del script:', error);
    process.exit(1);
  });

export { probarConsultaFinal };
