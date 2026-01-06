import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verificarEstadoActual() {
  try {
    const docenteId = 'a34a43e4-e68f-4225-87b0-397898a1e46b'; // ID del docente en tu ejemplo
    const materiaId = 'bdb7eafc-cb83-47f3-810d-c88f752b9047'; // ID de la materia en tu ejemplo

    console.log('🔍 Verificando estado actual...');
    console.log('Docente ID:', docenteId);
    console.log('Materia ID:', materiaId);

    // Verificar si existe el docente
    const docente = await prisma.user.findUnique({
      where: { id: docenteId },
      select: { id: true, nombre: true, email: true, rol: true }
    });
    console.log('👨‍🏫 Docente:', docente);

    // Verificar si existe la materia
    const materia = await prisma.materia.findUnique({
      where: { id: materiaId },
      select: { id: true, nombre: true, codigo: true }
    });
    console.log('📚 Materia:', materia);

    // Verificar todas las relaciones de este docente
    const todasLasRelaciones = await prisma.userMateria.findMany({
      where: { docenteId: docenteId },
      include: {
        materia: true,
        periodoAcademico: true
      }
    });

    console.log(`\n📋 Todas las relaciones del docente (${todasLasRelaciones.length}):`);
    todasLasRelaciones.forEach((rel, index) => {
      console.log(`${index + 1}. ${rel.materia.nombre} - ${rel.periodo} (${rel.periodoAcademico.name})`);
    });

    // Verificar relaciones específicas para esta materia
    const relacionesMateria = await prisma.userMateria.findMany({
      where: {
        docenteId: docenteId,
        materiaId: materiaId
      },
      include: {
        materia: true,
        periodoAcademico: true
      }
    });

    console.log(`\n📚 Relaciones para esta materia (${relacionesMateria.length}):`);
    relacionesMateria.forEach((rel, index) => {
      console.log(`${index + 1}. ID: ${rel.id}, Sección: ${rel.seccion}, Período: ${rel.periodo}, Estado: ${rel.estado}`);
    });

    // Verificar todos los períodos
    const todosLosPeriodos = await prisma.periodoAcademico.findMany({
      where: { status: 'upcoming' }
    });

    console.log(`\n📅 Todos los períodos disponibles (${todosLosPeriodos.length}):`);
    todosLosPeriodos.forEach((periodo, index) => {
      console.log(`${index + 1}. ${periodo.name} (${periodo.id}) - Current: ${periodo.isCurrent}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarEstadoActual();
