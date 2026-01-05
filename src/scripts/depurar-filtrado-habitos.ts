import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function depurarFiltradoHabitos() {
  console.log('🔍 Depurando filtrado de hábitos por grado...');

  // 1. Obtener todos los estudiantes
  const estudiantes = await prisma.student.findMany({
    take: 3,
    select: {
      id: true,
      nombre: true,
      apellido: true,
      grados: true
    }
  });

  console.log('\n👥 Estudiantes encontrados:');
  estudiantes.forEach(est => {
    console.log(`  - ${est.nombre} ${est.apellido} (${est.id}) - Grados: [${est.grados.join(', ')}]`);
  });

  // 2. Para cada estudiante, verificar qué materias deberían mostrarse
  for (const estudiante of estudiantes) {
    console.log(`\n📚 Analizando estudiante: ${estudiante.nombre} ${estudiante.apellido}`);
    console.log(`🎓 Grados: [${estudiante.grados.join(', ')}]`);

    // Construir las condiciones LIKE para cada grado
    const gradosConditions = estudiante.grados.map(grado => {
      // Extraer solo el grado base (ej: "1° Primaria A" -> "1° Primaria")
      const gradoBase = grado.split(' ')[0] + ' ' + grado.split(' ')[1];
      return `m.grados::text LIKE '%${gradoBase}%'`;
    }).join(' OR ');

    console.log(`🔍 Condiciones SQL: ${gradosConditions}`);

    // Consulta SQL para obtener materias que aplican
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
        OR m."tipoMateriaId" = 'e133dce1-bb77-4b05-bdcb-0dc5d4c5df19' 
        OR m."tipoMateriaId" = '16b47d65-2cb9-4c2e-8779-9e2f5576d896'
      )
      AND (${gradosConditions})
      ORDER BY m."orden" ASC, m."nombre" ASC
    `;

    const materiasFiltradas = await prisma.$queryRawUnsafe<any>(sqlQuery);

    console.log(`\n📋 Materias encontradas (${materiasFiltradas.length}):`);
    materiasFiltradas.forEach(m => {
      console.log(`  - ${m.nombre} (tipo: ${m.tipoMateriaNombre}, extracurricular: ${m.esExtracurricular})`);
      console.log(`    Grados: [${Array.isArray(m.grados) ? m.grados.join(', ') : 'N/A'}]`);
    });

    // 3. Verificar si hay materias de hábitos que deberían coincidir pero no aparecen
    console.log(`\n🔍 Materias de hábitos que deberían aplicar:`);
    
    const todasMateriasHabitos = await prisma.materia.findMany({
      where: {
        activa: true,
        OR: [
          { esExtracurricular: true },
          { tipoMateriaId: 'e133dce1-bb77-4b05-bdcb-0dc5d4c5df19' }, // HOGAR
          { tipoMateriaId: '16b47d65-2cb9-4c2e-8779-9e2f5576d896' }  // HABITO
        ]
      },
      select: {
        id: true,
        nombre: true,
        grados: true,
        tipoMateria: {
          select: { nombre: true }
        }
      }
    });

    todasMateriasHabitos.forEach(materia => {
      const tieneGradoCompatible = estudiante.grados.some(gradoEst => {
        const gradoBaseEst = gradoEst.split(' ')[0] + ' ' + gradoEst.split(' ')[1];
        return Array.isArray(materia.grados) && materia.grados.some((gradoMat: string) => {
          const gradoBaseMat = gradoMat.split(' ')[0] + ' ' + gradoMat.split(' ')[1];
          return gradoBaseMat === gradoBaseEst;
        });
      });

      if (tieneGradoCompatible) {
        const fueEncontrada = materiasFiltradas.some(m => m.id === materia.id);
        console.log(`  ${fueEncontrada ? '✅' : '❌'} ${materia.nombre} (${materia.tipoMateria?.nombre})`);
        if (!fueEncontrada) {
          console.log(`    ⚠️ Debería aparecer pero no fue encontrada`);
          console.log(`    📚 Grados materia: [${Array.isArray(materia.grados) ? materia.grados.join(', ') : 'N/A'}]`);
        }
      }
    });
  }
}

depurarFiltradoHabitos()
  .then(() => {
    console.log('🎉 Script ejecutado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error en la ejecución del script:', error);
    process.exit(1);
  });

export { depurarFiltradoHabitos };
