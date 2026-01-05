import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function buscarIDEvaluacionCorrecta() {
  try {
    const materiaNombre = 'Atiende junta de padres y maestros';
    
    console.log('🔍 Buscando evaluación correcta para:', materiaNombre);
    
    // Buscar la evaluación asociada a esta materia
    const evaluacion = await prisma.evaluacionHabito.findFirst({
      where: {
        nombre: materiaNombre,
        activo: true
      },
      select: {
        id: true,
        nombre: true,
        tipo: true,
        materiaId: true
      }
    });

    if (evaluacion) {
      console.log('✅ Evaluación encontrada:');
      console.log('  - ID:', evaluacion.id);
      console.log('  - Nombre:', evaluacion.nombre);
      console.log('  - Tipo:', evaluacion.tipo);
      console.log('  - materiaId:', evaluacion.materiaId);
      console.log('');
      console.log('🎯 ID que debe usar el frontend:', evaluacion.id);
    } else {
      console.log('❌ No se encontró evaluación para:', materiaNombre);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

buscarIDEvaluacionCorrecta();
