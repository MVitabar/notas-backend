import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mapeo para las 3 materias faltantes
const materiasFaltantes = {
  'Expresión Artística (Música)': ['4° Primaria', '5° Primaria', '6° Primaria'],
  'Práctica vocabulario de inglés diariamente': ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria'],
  'Programa de Lectura': ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria', '1° Básico', '2° Básico', '3° Básico', '4° PC', '5° PC', '6° PC', '4° BCL', '5° BCL']
};

async function completarFaltantes() {
  console.log('🔧 Completando las 3 materias faltantes...');
  
  try {
    for (const [nombreMateria, grados] of Object.entries(materiasFaltantes)) {
      // Buscar la materia por nombre
      const materia = await prisma.materia.findFirst({
        where: { 
          nombre: nombreMateria,
          activa: true
        }
      });
      
      if (materia) {
        // Actualizar la materia usando raw SQL
        await prisma.$executeRaw`
          UPDATE "Materia" 
          SET "grados" = ${grados}, "updatedAt" = NOW()
          WHERE "id" = ${materia.id}
        `;
        
        console.log(`✅ ${nombreMateria}: [${grados.join(', ')}]`);
      } else {
        console.log(`⚠️  No encontrada: ${nombreMateria}`);
      }
    }
    
    console.log('\n🎉 Materias faltantes completadas!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  completarFaltantes();
}
