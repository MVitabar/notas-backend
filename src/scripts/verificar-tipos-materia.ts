import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verificarTiposMateria() {
  console.log('🔍 Verificando tipos de materia disponibles...');

  const tipos = await prisma.tipoMateria.findMany({
    select: {
      id: true,
      nombre: true
    }
  });

  console.log('\n📋 Tipos de materia disponibles:');
  tipos.forEach(tipo => {
    console.log(`  - ${tipo.nombre}: ${tipo.id}`);
  });

  // También verificar algunas materias existentes para ver sus tipos
  console.log('\n🔍 Ejemplos de materias existentes:');
  const materiasEjemplo = await prisma.materia.findMany({
    take: 5,
    select: {
      nombre: true,
      tipoMateriaId: true,
      tipoMateria: {
        select: {
          nombre: true
        }
      }
    }
  });

  materiasEjemplo.forEach(materia => {
    console.log(`  - ${materia.nombre}: ${materia.tipoMateria?.nombre} (${materia.tipoMateriaId})`);
  });
}

verificarTiposMateria()
  .then(() => {
    console.log('🎉 Script ejecutado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error en la ejecución del script:', error);
    process.exit(1);
  });

export { verificarTiposMateria };
