import { PrismaClient, TipoCalificacion } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Crear materias extracurriculares
  const materiasExtracurriculares = [
    { 
      nombre: 'Comprensión de Lectura', 
      codigo: 'EXT-001', 
      creditos: 0, 
      esExtracurricular: true, 
      orden: 1 
    },
    { 
      nombre: 'Lógica Matemática', 
      codigo: 'EXT-002', 
      creditos: 0, 
      esExtracurricular: true, 
      orden: 2 
    }
  ];

  for (const materia of materiasExtracurriculares) {
    await prisma.materia.upsert({
      where: { codigo: materia.codigo },
      update: {},
      create: materia
    });
  }

  // Crear evaluaciones de hábitos por defecto
  const habitosBase = [
    // Hábitos de casa
    { 
      nombre: 'Lee diariamente', 
      tipo: 'habito_casa',
      orden: 1,
      descripcion: 'El estudiante dedica tiempo diario a la lectura.'
    },
    { 
      nombre: 'Practica matemáticas', 
      tipo: 'habito_casa',
      orden: 2,
      descripcion: 'El estudiante practica ejercicios matemáticos regularmente.'
    },
    // Responsabilidades de aprendizaje
    { 
      nombre: 'Entrega tareas a tiempo', 
      tipo: 'responsabilidad_aprendizaje',
      orden: 1,
      descripcion: 'El estudiante cumple con las fechas de entrega de tareas.'
    },
    { 
      nombre: 'Participa en clase', 
      tipo: 'responsabilidad_aprendizaje',
      orden: 2,
      descripcion: 'El estudiante participa activamente en las clases.'
    },
    // Comportamiento
    { 
      nombre: 'Respeta a sus compañeros', 
      tipo: 'comportamiento',
      orden: 1,
      descripcion: 'El estudiante muestra respeto hacia sus compañeros.'
    },
    { 
      nombre: 'Sigue instrucciones', 
      tipo: 'comportamiento',
      orden: 2,
      descripcion: 'El estudiante sigue las indicaciones del docente.'
    }
  ];

  for (const habito of habitosBase) {
    await prisma.evaluacionHabito.upsert({
      where: { 
        nombre_tipo: {
          nombre: habito.nombre,
          tipo: habito.tipo
        }
      },
      update: {},
      create: habito
    });
  }

  // Crear usuario administrador si no existe
  const adminEmail = 'admin@example.com';
  const adminExists = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        nombre: 'Administrador',
        apellido: 'Sistema',
        rol: 'ADMIN',
        requiresPasswordChange: false,
        activo: true
      }
    });
  }

  console.log('Datos de seed creados exitosamente');
}

main()
  .catch((e) => {
    console.error('Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
