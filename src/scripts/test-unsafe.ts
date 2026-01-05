import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function testUnsafeQuery() {
  const infoEstudiante = { grados: ['1° Primaria'] };
  
  try {
    const gradosConditions = infoEstudiante.grados.map(grado => `m.grados::text LIKE '%${grado}%'`).join(' OR ');
    
    const sqlQuery = `
      SELECT 
        m.id,
        m.nombre,
        m.descripcion,
        m.codigo,
        m.creditos,
        m.activa,
        m."esExtracurricular",
        m.orden,
        m."createdAt",
        m."updatedAt",
        m."tipoMateriaId",
        m.grados,
        tm.nombre as "tipoMateriaNombre",
        tm.descripcion as "tipoMateriaDescripcion"
      FROM "Materia" m
      LEFT JOIN "TipoMateria" tm ON m."tipoMateriaId" = tm.id
      WHERE m."activa" = true
      AND (
        m."esExtracurricular" = true 
        OR m."tipoMateriaId" = 'e133dce1-bb77-4b05-bdcb-0dc5d4c5df19' 
        OR m."tipoMateriaId" = '16b47d65-2cb9-4c2e-8779-9e2f5576d896'
      )
      AND (${gradosConditions})
      ORDER BY m."orden" ASC, m."nombre" ASC
    `;

    const materiasHabitosRaw = await prisma.$queryRawUnsafe<any>(sqlQuery);
    
    console.log('📚 Materias encontradas con $queryRawUnsafe:');
    console.log(`Total: ${materiasHabitosRaw.length}`);
    materiasHabitosRaw.forEach((m: any, index) => {
      console.log(`${index + 1}. ${m.nombre}`);
      console.log(`   tipoMateriaId: ${m.tipoMateriaId}`);
      console.log(`   grados: [${m.grados?.join(', ')}]`);
      console.log('---');
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testUnsafeQuery();
