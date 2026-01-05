import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verificarIdsReales() {
  console.log('🔍 Verificando IDs reales de tipos de materia y materias...');

  try {
    // 1. Obtener todos los tipos de materia
    const tiposMateria = await prisma.tipoMateria.findMany({
      select: {
        id: true,
        nombre: true
      }
    });

    console.log('\n📋 Tipos de materia en la base de datos:');
    tiposMateria.forEach(tipo => {
      console.log(`  - ${tipo.nombre}: ${tipo.id}`);
    });

    // 2. Obtener materias de hábitos (no extracurriculares)
    const materiasHabitos = await prisma.materia.findMany({
      where: {
        activa: true,
        esExtracurricular: false,
        tipoMateriaId: {
          in: tiposMateria.map(t => t.id)
        }
      },
      select: {
        id: true,
        nombre: true,
        tipoMateriaId: true,
        grados: true,
        tipoMateria: {
          select: {
            nombre: true
          }
        }
      }
    });

    console.log('\n📚 Materias de hábitos (no extracurriculares):');
    materiasHabitos.forEach(materia => {
      console.log(`  - ${materia.nombre} (${materia.tipoMateria?.nombre})`);
      console.log(`    ID: ${materia.id}`);
      console.log(`    Tipo ID: ${materia.tipoMateriaId}`);
      console.log(`    Grados: [${Array.isArray(materia.grados) ? materia.grados.join(', ') : 'N/A'}]`);
    });

    // 3. Agrupar por tipo de materia
    const porTipo = materiasHabitos.reduce((acc: any, materia) => {
      const tipoNombre = materia.tipoMateria?.nombre || 'SIN_TIPO';
      if (!acc[tipoNombre]) {
        acc[tipoNombre] = [];
      }
      acc[tipoNombre].push(materia);
      return acc;
    }, {});

    console.log('\n📊 Materias agrupadas por tipo:');
    Object.entries(porTipo).forEach(([tipo, materias]: [string, any]) => {
      console.log(`\n${tipo} (${materias.length}):`);
      materias.forEach((m: any) => {
        console.log(`  - ${m.nombre}`);
      });
    });

    // 4. Verificar cuáles deberían aparecer para un estudiante de 1° Primaria
    const estudianteGrados = ['1° Primaria A'];
    console.log('\n🎓 Materias que aplican para estudiante de 1° Primaria:');
    
    materiasHabitos.forEach(materia => {
      if (Array.isArray(materia.grados)) {
        const tieneGradoCompatible = estudianteGrados.some(gradoEst => {
          const gradoBaseEst = gradoEst.split(' ')[0] + ' ' + gradoEst.split(' ')[1];
          return materia.grados.some((gradoMat: string) => {
            const gradoBaseMat = gradoMat.split(' ')[0] + ' ' + gradoMat.split(' ')[1];
            return gradoBaseMat === gradoBaseEst;
          });
        });

        if (tieneGradoCompatible) {
          console.log(`  ✅ ${materia.nombre} (${materia.tipoMateria?.nombre})`);
        }
      }
    });

    console.log('\n🎯 IDs correctos para usar en el servicio:');
    console.log(`  - HOGAR: ${tiposMateria.find(t => t.nombre === 'HOGAR')?.id}`);
    console.log(`  - HABITO: ${tiposMateria.find(t => t.nombre === 'HABITO')?.id}`);
    console.log(`  - EXTRACURRICULAR: ${tiposMateria.find(t => t.nombre === 'EXTRACURRICULAR')?.id}`);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

verificarIdsReales()
  .then(() => {
    console.log('\n🎉 Script ejecutado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error en la ejecución del script:', error);
    process.exit(1);
  });

export { verificarIdsReales };
