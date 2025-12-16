import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// List all extracurricular activities
async function listExtracurricularActivities() {
  const activities = await prisma.materia.findMany({
    where: {
      tipoMateria: {
        nombre: 'EXTRACURRICULAR'
      }
    },
    include: {
      tipoMateria: true
    }
  });
  
  console.log('Extracurricular Activities:');
  console.table(activities.map(activity => ({
    id: activity.id,
    nombre: activity.nombre,
    codigo: activity.codigo,
    descripcion: activity.descripcion,
    activa: activity.activa ? '✅' : '❌'
  })));
  
  return activities;
}

// Add a new extracurricular activity
async function addExtracurricularActivity(name: string, code: string, description: string = '') {
  // Find the EXTRACURRICULAR type
  let tipo = await prisma.tipoMateria.findFirst({
    where: { nombre: 'EXTRACURRICULAR' }
  });

  // If it doesn't exist, create it
  if (!tipo) {
    tipo = await prisma.tipoMateria.create({
      data: {
        nombre: 'EXTRACURRICULAR',
        descripcion: 'Actividades extracurriculares'
      }
    });
  }

  // Create the new activity
  const activity = await prisma.materia.create({
    data: {
      nombre: name,
      codigo: code,
      descripcion: description,
      creditos: 0, // Extracurricular activities typically don't have credits
      tipoMateriaId: tipo.id
    }
  });

  console.log('Added new extracurricular activity:');
  console.log(activity);
  return activity;
}

// Update an existing extracurricular activity
async function updateExtracurricularActivity(id: string, data: {
  nombre?: string;
  codigo?: string;
  descripcion?: string;
  activa?: boolean;
}) {
  const activity = await prisma.materia.update({
    where: { id },
    data: {
      ...data,
      updatedAt: new Date()
    }
  });

  console.log('Updated extracurricular activity:');
  console.log(activity);
  return activity;
}

// Example usage
async function main() {
  try {
    // List all extracurricular activities
    await listExtracurricularActivities();
    
    // Uncomment to add a new activity
    // await addExtracurricularActivity(
    //   'Programa de Lectura', 
    //   'EXT-LECT-001',
    //   'Programa de fomento a la lectura'
    // );
    
    // Uncomment to update an activity
    // await updateExtracurricularActivity('activity-id-here', {
    //   nombre: 'New Name',
    //   activa: true
    // });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
main();
