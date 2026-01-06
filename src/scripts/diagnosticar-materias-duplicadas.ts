import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function diagnosticarMateriasDuplicadas() {
  try {
    console.log('🔍 Diagnosticando materias duplicadas...');

    // Buscar materias con el mismo nombre
    const materias = await prisma.materia.findMany({
      where: {
        nombre: {
          contains: 'Filosofía'
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    console.log(`📚 Se encontraron ${materias.length} materias con "Filosofía":`);
    materias.forEach((materia, index) => {
      console.log(`${index + 1}. ID: ${materia.id}, Nombre: ${materia.nombre}, Código: ${materia.codigo}, Creada: ${materia.createdAt}`);
    });

    // Verificar relaciones userMateria para estas materias
    const materiaIds = materias.map(m => m.id);
    const relaciones = await prisma.userMateria.findMany({
      where: {
        materiaId: {
          in: materiaIds
        }
      },
      include: {
        materia: true,
        periodoAcademico: true,
        docente: {
          select: {
            id: true,
            nombre: true,
            email: true
          }
        }
      }
    });

    console.log(`\n📋 Se encontraron ${relaciones.length} relaciones userMateria:`);
    relaciones.forEach((rel, index) => {
      console.log(`${index + 1}. Materia: ${rel.materia.nombre} (${rel.materiaId}), Período: ${rel.periodo} (${rel.periodoAcademicoId}), Docente: ${rel.docente.email}`);
    });

    // Verificar si hay materias duplicadas exactamente
    const materiasGrouped = materias.reduce((acc, materia) => {
      const key = materia.nombre.toLowerCase();
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(materia);
      return acc;
    }, {} as Record<string, any[]>);

    console.log('\n🔍 Materias agrupadas por nombre:');
    Object.entries(materiasGrouped).forEach(([nombre, materiasLista]) => {
      if (materiasLista.length > 1) {
        console.log(`⚠️ ${nombre}: ${materiasLista.length} registros duplicados`);
        materiasLista.forEach(m => {
          console.log(`   - ID: ${m.id}, Código: ${m.codigo}, Creada: ${m.createdAt}`);
        });
      } else {
        console.log(`✅ ${nombre}: 1 registro`);
      }
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

diagnosticarMateriasDuplicadas();
