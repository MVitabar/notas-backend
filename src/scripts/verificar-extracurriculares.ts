import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function verificarExtracurriculares() {
  try {
    console.log('🔍 Verificando materias extracurriculares en la base de datos...\n');
    
    // Obtener todas las materias extracurriculares activas
    const extracurriculares = await prisma.materia.findMany({
      where: {
        activa: true,
        esExtracurricular: true
      },
      select: {
        id: true,
        nombre: true,
        grados: true,
        orden: true
      },
      orderBy: [
        { orden: 'asc' },
        { nombre: 'asc' }
      ]
    });
    
    console.log(`📚 Total de materias extracurriculares activas: ${extracurriculares.length}\n`);
    
    // Agrupar por nombre para ver duplicados
    const agrupadas = extracurriculares.reduce((acc, materia) => {
      const key = materia.nombre;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(materia);
      return acc;
    }, {} as Record<string, any[]>);
    
    console.log('📋 Materias extracurriculares encontradas:');
    Object.entries(agrupadas).forEach(([nombre, materias]) => {
      console.log(`\n🔹 ${nombre}`);
      materias.forEach(m => {
        console.log(`   ID: ${m.id}`);
        console.log(`   Grados: [${m.grados?.join(', ')}]`);
        console.log(`   Orden: ${m.orden}`);
      });
    });
    
    // Verificar si existen las materias esperadas según la configuración
    const materiasEsperadas = [
      'Comprensión de Lectura',
      'Lógica Matemática', 
      'Moral Cristiana',
      'Programa de Lectura',
      'RAZONAMIENTO VERBAL'
    ];
    
    console.log(`\n🎯 Verificando materias esperadas:`);
    materiasEsperadas.forEach(materiaEsperada => {
      const encontradas = agrupadas[materiaEsperada] || [];
      if (encontradas.length > 0) {
        console.log(`✅ ${materiaEsperada} - Encontrada (${encontradas.length} registros)`);
      } else {
        console.log(`❌ ${materiaEsperada} - NO encontrada`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarExtracurriculares();
