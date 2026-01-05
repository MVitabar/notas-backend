import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verificarEstado() {
  console.log('📊 ESTADO FINAL DE LA BASE DE DATOS');
  console.log('=====================================');
  
  try {
    // Materias con grados asignados
    const conGradosResult = await prisma.$queryRaw<any>`
      SELECT COUNT(*) as count 
      FROM "Materia" 
      WHERE "activa" = true 
      AND "grados" != '{}'
    `;
    
    // Materias sin grados
    const sinGradosResult = await prisma.$queryRaw<any>`
      SELECT COUNT(*) as count 
      FROM "Materia" 
      WHERE "activa" = true 
      AND "grados" = '{}'
    `;
    
    // Total de materias activas
    const totalResult = await prisma.$queryRaw<any>`
      SELECT COUNT(*) as count 
      FROM "Materia" 
      WHERE "activa" = true
    `;
    
    const conGrados = Number(conGradosResult[0]?.count || 0);
    const sinGrados = Number(sinGradosResult[0]?.count || 0);
    const total = Number(totalResult[0]?.count || 0);
    
    console.log(`✅ Materias con grados asignados: ${conGrados}`);
    console.log(`⚠️  Materias sin grados: ${sinGrados}`);
    console.log(`📚 Total materias activas: ${total}`);
    console.log(`📈 Porcentaje completo: ${Math.round((conGrados/total)*100)}%`);
    
    // Mostrar las materias sin grados
    const materiasSinGrados = await prisma.$queryRaw<any>`
      SELECT nombre, "tipoMateriaId"
      FROM "Materia" 
      WHERE "activa" = true 
      AND "grados" = '{}'
      ORDER BY nombre
    `;
    
    if (materiasSinGrados.length > 0) {
      console.log(`\n⚠️  Materias sin grados (${materiasSinGrados.length}):`);
      materiasSinGrados.forEach(m => {
        console.log(`  - ${m.nombre}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarEstado();
