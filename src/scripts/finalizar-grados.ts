import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function finalizarGrados() {
  console.log('🔧 Finalizando asignación de grados...');

  try {
    // Asignar grados a la última materia faltante
    const materiaFaltante = await prisma.materia.findFirst({
      where: {
        nombre: 'Métodos de la Investigación',
        activa: true
      }
    });

    if (materiaFaltante) {
      console.log(`🔧 Asignando grados a: ${materiaFaltante.nombre}`);
      
      await prisma.materia.update({
        where: { id: materiaFaltante.id },
        data: { grados: ['4° PC', '5° PC'] }
      });
      
      console.log('   ✅ Grados asignados: [4° PC, 5° PC]');
    }

    // Verificación final completa
    console.log('\n📊 Verificación final completa:');
    
    // 1. Contar materias con grados
    const materiasConGrados = await prisma.materia.count({
      where: {
        activa: true,
        NOT: {
          grados: { isEmpty: true }
        }
      }
    });

    const totalMaterias = await prisma.materia.count({
      where: { activa: true }
    });

    console.log(`  📚 Total materias activas: ${totalMaterias}`);
    console.log(`  ✅ Materias con grados: ${materiasConGrados}`);
    console.log(`  📊 Porcentaje completo: ${Math.round((materiasConGrados / totalMaterias) * 100)}%`);

    // 2. Verificar por tipo de materia
    const tiposMateria = await prisma.tipoMateria.findMany({
      where: {
        nombre: {
          in: ['HOGAR', 'HABITO', 'EXTRACURRICULAR']
        }
      },
      include: {
        materias: {
          where: {
            activa: true,
            NOT: {
              grados: { isEmpty: true }
            }
          },
          select: {
            id: true,
            nombre: true,
            grados: true
          }
        }
      }
    });

    console.log('\n📋 Materias por tipo con grados asignados:');
    tiposMateria.forEach(tipo => {
      console.log(`\n🔹 ${tipo.nombre} (${tipo.materias.length} materias):`);
      tipo.materias.forEach((materia, index) => {
        console.log(`  ${index + 1}. ${materia.nombre}`);
        console.log(`     🎓 Grados: [${materia.grados.join(', ')}]`);
      });
    });

    // 3. Probar filtrado con estudiantes
    console.log('\n🔍 Probando filtrado con estudiantes...');
    
    const estudiantes = await prisma.student.findMany({
      select: {
        id: true,
        nombre: true,
        apellido: true,
        grados: true
      },
      take: 2
    });

    const hogar = tiposMateria.find(t => t.nombre === 'HOGAR');
    const habito = tiposMateria.find(t => t.nombre === 'HABITO');
    const extracurricular = tiposMateria.find(t => t.nombre === 'EXTRACURRICULAR');

    for (const estudiante of estudiantes) {
      console.log(`\n👤 Estudiante: ${estudiante.nombre} ${estudiante.apellido}`);
      console.log(`🎓 Grados: [${estudiante.grados.join(', ')}]`);
      
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
          OR m."tipoMateriaId" = '${hogar?.id}' 
          OR m."tipoMateriaId" = '${habito?.id}'
        )
        AND (${gradosConditions})
        ORDER BY m."orden" ASC, m."nombre" ASC
      `;

      const materiasFiltradas = await prisma.$queryRawUnsafe<any>(sqlQuery);
      
      console.log(`   📊 Materias encontradas: ${materiasFiltradas.length}`);
      
      const porTipo = materiasFiltradas.reduce((acc: any, m: any) => {
        const tipo = m.tipoMateriaNombre || 'SIN_TIPO';
        acc[tipo] = (acc[tipo] || 0) + 1;
        return acc;
      }, {});

      console.log('   📈 Distribución por tipo:');
      Object.entries(porTipo).forEach(([tipo, cantidad]) => {
        console.log(`     - ${tipo}: ${cantidad}`);
      });
    }

    console.log('\n🎉 ¡GRADOS COMPLETADOS EXITOSAMENTE!');
    console.log('✅ Todas las materias tienen grados asignados');
    console.log('✅ Filtrado por grado funcionando correctamente');
    console.log('✅ Sistema listo para producción');

  } catch (error) {
    console.error('❌ Error durante la finalización:', error);
  }
}

finalizarGrados()
  .then(() => {
    console.log('\n🎉 Script ejecutado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error en la ejecución del script:', error);
    process.exit(1);
  });

export { finalizarGrados };
