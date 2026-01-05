import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function verificarEvaluacionesRegulares() {
  try {
    console.log('🔍 Verificando evaluaciones regulares que causan duplicados...\n');
    
    // Obtener evaluaciones regulares que podrían duplicar materias
    const evaluacionesRegulares = await prisma.evaluacionHabito.findMany({
      where: {
        activo: true,
        tipo: {
          in: ['COMPORTAMIENTO', 'APRENDIZAJE', 'CASA']
        }
      },
      select: {
        id: true,
        nombre: true,
        tipo: true
      },
      orderBy: { nombre: 'asc' }
    });
    
    console.log(`📋 Total de evaluaciones regulares: ${evaluacionesRegulares.length}\n`);
    
    // Agrupar por nombres similares
    const grupos: Record<string, any[]> = {};
    evaluacionesRegulares.forEach(ev => {
      const nombreSimple = ev.nombre.toUpperCase().replace(/[^A-ZÑÁÉÍÓÚ]/g, '');
      if (!grupos[nombreSimple]) {
        grupos[nombreSimple] = [];
      }
      grupos[nombreSimple].push(ev);
    });
    
    console.log('🚨 Posibles duplicados (nombres similares):');
    Object.entries(grupos).forEach(([clave, evaluaciones]: [string, any[]]) => {
      if (evaluaciones.length > 1) {
        console.log(`\n🔹 ${clave}:`);
        evaluaciones.forEach(ev => {
          console.log(`   - ${ev.nombre} (${ev.tipo})`);
        });
      }
    });
    
    // Verificar duplicados específicos que vemos en el frontend
    console.log('\n🎯 Verificando duplicados específicos del frontend:');
    const problematicas = [
      'COMPLETA TRABAJOS A TIEMPO',
      'PARTICIPA EN ACTIVIDADES DE APRENDIZAJE',
      'PRÁCTICA DIARIMAENTE LO ESTUDIADO'
    ];
    
    problematicas.forEach(nombre => {
      const encontradas = evaluacionesRegulares.filter(ev => 
        ev.nombre.includes(nombre.split(' ')[0]) || 
        ev.nombre.toLowerCase().includes(nombre.toLowerCase())
      );
      
      if (encontradas.length > 0) {
        console.log(`\n⚠️ ${nombre}:`);
        encontradas.forEach(ev => {
          console.log(`   - ${ev.nombre} (ID: ${ev.id})`);
        });
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarEvaluacionesRegulares();
