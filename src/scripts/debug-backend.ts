import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function debugBackend() {
  try {
    // Simular el proceso del backend
    const infoEstudiante = { grados: ['1° Primaria A'] };
    
    console.log('🔍 DEPURACIÓN - Grado del estudiante:', infoEstudiante.grados.join(', '));

    // Construir las condiciones LIKE para cada grado (usando solo el grado base)
    const gradosConditions = infoEstudiante.grados.map(grado => {
      // Extraer solo el grado base (ej: "1° Primaria A" -> "1° Primaria")
      const gradoBase = grado.split(' ')[0] + ' ' + grado.split(' ')[1];
      return `m.grados::text LIKE '%${gradoBase}%'`;
    }).join(' OR ');
    
    console.log('📋 Condiciones SQL corregidas:', gradosConditions);
    
    // Construir la consulta SQL completa
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

    console.log('📄 Consulta SQL completa:', sqlQuery.substring(0, 200) + '...');

    const materiasHabitosRaw = await prisma.$queryRawUnsafe<any>(sqlQuery);
    
    console.log(`📚 Materias encontradas: ${materiasHabitosRaw.length}`);
    if (materiasHabitosRaw.length > 0) {
      console.log('📋 Primeras materias:');
      materiasHabitosRaw.slice(0, 3).forEach((m: any, index) => {
        console.log(`  ${index + 1}. ${m.nombre}`);
        console.log(`     tipoMateriaId: ${m.tipoMateriaId}`);
        console.log(`     grados: [${m.grados?.join(', ')}]`);
      });
    } else {
      console.log('⚠️ No se encontraron materias con la consulta SQL');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugBackend();
