import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verificarIDs() {
  try {
    console.log('🔍 Verificando IDs en la base de datos...');

    const estudianteId = '979327a2-61b3-4cc1-a2c3-3f13c806aab6';
    const materiaId = 'bdb7eafc-cb83-47f3-810d-c88f752b9047';
    const periodoId = 'a67785f4-259b-4901-940f-b7246317edd4';
    const docenteId = 'e5c09c42-d778-46bb-b8d0-92f40ec60c1d';

    // Verificar estudiante
    const estudiante = await prisma.student.findUnique({
      where: { id: estudianteId },
      select: { id: true, nombre: true, apellido: true }
    });
    console.log('👨‍🎓 Estudiante:', estudiante || '❌ No encontrado');

    // Verificar materia
    const materia = await prisma.materia.findUnique({
      where: { id: materiaId },
      select: { id: true, nombre: true }
    });
    console.log('📚 Materia:', materia || '❌ No encontrado');

    // Verificar período
    const periodo = await prisma.periodoAcademico.findUnique({
      where: { id: periodoId },
      select: { id: true, name: true }
    });
    console.log('📅 Período:', periodo || '❌ No encontrado');

    // Verificar docente
    const docente = await prisma.user.findUnique({
      where: { id: docenteId },
      select: { id: true, nombre: true, email: true }
    });
    console.log('👨‍🏫 Docente:', docente || '❌ No encontrado');

    // Si algún ID no existe, mostrar IDs disponibles
    if (!estudiante || !materia || !periodo || !docente) {
      console.log('\n📋 IDs disponibles:');
      
      if (!estudiante) {
        const estudiantes = await prisma.student.findMany({
          select: { id: true, nombre: true, apellido: true },
          take: 5
        });
        console.log('👨‍🎓 Estudiantes disponibles:');
        estudiantes.forEach(e => console.log(`  - ${e.id}: ${e.nombre} ${e.apellido}`));
      }

      if (!materia) {
        const materias = await prisma.materia.findMany({
          select: { id: true, nombre: true },
          take: 5
        });
        console.log('📚 Materias disponibles:');
        materias.forEach(m => console.log(`  - ${m.id}: ${m.nombre}`));
      }

      if (!periodo) {
        const periodos = await prisma.periodoAcademico.findMany({
          select: { id: true, name: true },
          take: 5
        });
        console.log('📅 Períodos disponibles:');
        periodos.forEach(p => console.log(`  - ${p.id}: ${p.name}`));
      }

      if (!docente) {
        const docentes = await prisma.user.findMany({
          where: { rol: 'DOCENTE' },
          select: { id: true, nombre: true, email: true },
          take: 5
        });
        console.log('👨‍🏫 Docentes disponibles:');
        docentes.forEach(d => console.log(`  - ${d.id}: ${d.nombre} (${d.email})`));
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarIDs();
