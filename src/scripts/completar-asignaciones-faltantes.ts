import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function completarAsignacionesFaltantes() {
  try {
    console.log('🔍 Completando asignaciones faltantes...');

    // Obtener TODOS los períodos académicos (sin filtrar)
    const allPeriods = await prisma.periodoAcademico.findMany();
    console.log(`📅 Total de períodos en la base de datos: ${allPeriods.length}`);
    allPeriods.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name} (${p.id}) - Status: ${p.status}, Current: ${p.isCurrent}`);
    });

    // Docente y materia del ejemplo
    const docenteId = 'a34a43e4-e68f-4225-87b0-397898a1e46b';
    const materiaId = 'bdb7eafc-cb83-47f3-810d-c88f752b9047'; // Psicología

    // Obtener asignaciones existentes
    const asignacionesExistentes = await prisma.userMateria.findMany({
      where: {
        docenteId: docenteId,
        materiaId: materiaId
      }
    });

    console.log(`\n📋 Asignaciones existentes: ${asignacionesExistentes.length}`);
    asignacionesExistentes.forEach(a => {
      console.log(`- ${a.periodo} (${a.periodoAcademicoId})`);
    });

    // Identificar períodos faltantes
    const periodosExistentesIds = asignacionesExistentes.map(a => a.periodoAcademicoId);
    const periodosFaltantes = allPeriods.filter(p => !periodosExistentesIds.includes(p.id));

    console.log(`\n⚠️ Períodos faltantes: ${periodosFaltantes.length}`);
    periodosFaltantes.forEach(p => {
      console.log(`- ${p.name} (${p.id})`);
    });

    if (periodosFaltantes.length > 0) {
      // Crear las relaciones faltantes
      const nuevasRelaciones = periodosFaltantes.map(periodo => ({
        docenteId: docenteId,
        materiaId: materiaId,
        seccion: 'A',
        horario: 'Por definir',
        periodo: periodo.name,
        estado: 'activo',
        periodoAcademicoId: periodo.id
      }));

      console.log(`\n➕ Creando ${nuevasRelaciones.length} nuevas relaciones...`);
      
      const resultado = await prisma.userMateria.createMany({
        data: nuevasRelaciones,
        skipDuplicates: true
      });

      console.log(`✅ Se crearon ${resultado.count} nuevas asignaciones`);

      // Verificar el resultado final
      const asignacionesFinales = await prisma.userMateria.findMany({
        where: {
          docenteId: docenteId,
          materiaId: materiaId
        },
        include: {
          periodoAcademico: true
        },
        orderBy: {
          periodoAcademico: {
            name: 'asc'
          }
        }
      });

      console.log(`\n📊 Asignaciones finales: ${asignacionesFinales.length}`);
      asignacionesFinales.forEach(a => {
        console.log(`✅ ${a.materiaId} - ${a.periodo} (${a.periodoAcademico.name}) - Estado: ${a.estado}`);
      });
    } else {
      console.log('\n✅ Ya existen asignaciones para todos los períodos');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

completarAsignacionesFaltantes();
