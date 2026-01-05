import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mapeo simple de materias de hábitos a grados
const HABITOS_GRADOS = {
  // Hábitos - Primaria (todos los grados)
  'Llega a tiempo': ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria'],
  'Viene preparado para aprender': ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria'],
  'Termina tareas': ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria'],
  'Lee diariamente en casa': ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria'],
  'Atiende junta de padres y maestros': ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria'],
  'Práctica matemáticas diariamente': ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria'],
  'Práctica, vocabulario de inglés diariamente': ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria'],
  'Respeta autoridad': ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria'],
  'Interactúa bien con sus compañeros': ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria'],
  'Respeta los derechos y propiedades de otros': ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria'],
  'Demuestra control de sí mismo': ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria'],
  'Acepta responsabilidad de sus acciones': ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria'],
  'Completa trabajo / asignatura, a tiempo': ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria'],
  'Regresa tareas terminadas y notas firmadas a tiempo': ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria'],
  'Participa e interactúa en actividades de aprendizaje': ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria'],
  'Práctica valores morales diariamente': ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria'],
  
  // Extracurriculares - Primaria
  'Comprensión de Lectura': ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria'],
  'Lógica Matemática': ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria'],
  'Moral Cristiana': ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria'],
  
  // Variantes en mayúsculas - PC
  'COMPLETA TRABAJOS A TIEMPO': ['4° PC', '5° PC', '6° PC'],
  'PARTICIPA EN ACTIVIDADES DE APRENDIZAJE': ['4° PC', '5° PC', '6° PC'],
  'PRÁCTICA DIARIMAENTE LO ESTUDIADO': ['4° PC', '5° PC', '6° PC'],
  'Completa Trabajos a Tiempo': ['4° PC', '5° PC', '6° PC'],
  'Práctica diariamente lo estudiado': ['4° PC', '5° PC', '6° PC']
};

async function asignarGrados() {
  console.log('🔧 Asignando grados a materias de hábitos...');
  
  try {
    const materias = await prisma.materia.findMany({
      where: { 
        activa: true,
        OR: [
          { esExtracurricular: true },
          { tipoMateriaId: 'e133dce1-bb77-4b05-bdcb-0dc5d4c5df19' }, // HOGAR
          { tipoMateriaId: '16b47d65-2cb9-4c2e-8779-9e2f5576d896' }  // HABITO
        ]
      }
    });
    
    console.log(`📚 Procesando ${materias.length} materias de hábitos...`);
    
    for (const materia of materias) {
      const grados = HABITOS_GRADOS[materia.nombre] || [];
      
      // Actualizar la materia usando raw SQL para evitar problemas con el tipo
      await prisma.$executeRaw`
        UPDATE "Materia" 
        SET "grados" = ${grados}, "updatedAt" = NOW()
        WHERE "id" = ${materia.id}
      `;
      
      console.log(`✅ ${materia.nombre}: [${grados.join(', ')}]`);
    }
    
    console.log('\n🎉 Grados asignados correctamente!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  asignarGrados();
}
