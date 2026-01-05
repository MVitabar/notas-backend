import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkGradosFormat() {
  try {
    const result = await prisma.$queryRaw`
      SELECT nombre, "grados", "tipoMateriaId"
      FROM "Materia" 
      WHERE "activa" = true 
      AND "tipoMateriaId" = '16b47d65-2cb9-4c2e-8779-9e2f5576d896'
      AND nombre LIKE '%Completa trabajo%'
      LIMIT 3
    `;
    
    console.log('🔍 Formato de grados en BD:');
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkGradosFormat();
