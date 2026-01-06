import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function crearDatosPrueba() {
  try {
    console.log('🔧 Creando datos de prueba...');

    // 1. Crear períodos académicos
    console.log('📅 Creando períodos académicos...');
    const periodos = await Promise.all([
      prisma.periodoAcademico.upsert({
        where: { id: 'a67785f4-259b-4901-940f-b7246317edd4' },
        update: {},
        create: {
          id: 'a67785f4-259b-4901-940f-b7246317edd4',
          name: '2026-1',
          startDate: new Date('2026-01-01'),
          endDate: new Date('2026-03-31'),
          isCurrent: true,
          status: 'active'
        }
      }),
      prisma.periodoAcademico.upsert({
        where: { id: '6ef67301-4e00-4f5b-b8d7-1318697a8f7c' },
        update: {},
        create: {
          id: '6ef67301-4e00-4f5b-b8d7-1318697a8f7c',
          name: '2026-2',
          startDate: new Date('2026-04-01'),
          endDate: new Date('2026-06-30'),
          isCurrent: false,
          status: 'active'
        }
      })
    ]);

    console.log(`✅ Períodos creados: ${periodos.length}`);

    // 2. Crear docente
    console.log('👨‍🏫 Creando docente...');
    const docente = await prisma.user.upsert({
      where: { email: 'profesor1@mail.com' },
      update: {},
      create: {
        id: '08d01b29-1adb-4bc7-92b7-f7a2dd60e166',
        email: 'profesor1@mail.com',
        password: 'password123',
        nombre: 'profesor1',
        apellido: 'profe',
        rol: 'DOCENTE',
        telefono: '985647582',
        activo: true
      }
    });

    // 3. Crear perfil de docente
    await prisma.teacherProfile.upsert({
      where: { userId: docente.id },
      update: {},
      create: {
        userId: docente.id,
        grados: ['4° Bachillerato en Ciencias y Letras', '5° Bachillerato en Ciencias y Letras'],
        status: 'active'
      }
    });

    console.log('✅ Docente creado:', docente.email);

    // 4. Crear estudiante
    console.log('👨‍🎓 Creando estudiante...');
    const estudiante = await prisma.student.upsert({
      where: { id: 'ad596873-05fe-4abc-adbe-9fe2fc2de4e4' },
      update: {},
      create: {
        id: 'ad596873-05fe-4abc-adbe-9fe2fc2de4e4',
        nombre: 'estudiante1',
        apellido: 'estud',
        email: 'estudiante1@mail.com',
        telefono: '123456789',
        grados: ['4° Bachillerato en Ciencias y Letras'],
        dni: '12345678',
        fechaNacimiento: new Date('2005-01-01'),
        activo: true
      }
    });

    console.log('✅ Estudiante creado:', estudiante.email);

    // 5. Asignar materia al docente para todos los períodos
    console.log('📚 Asignando materia al docente...');
    const materiaId = '01287dda-77f3-4753-846a-299f549803f3'; // Respeta autoridad
    
    for (const periodo of periodos) {
      await prisma.userMateria.upsert({
        where: {
          docenteId_materiaId_seccion_periodoAcademicoId: {
            docenteId: docente.id,
            materiaId: materiaId,
            seccion: 'A',
            periodoAcademicoId: periodo.id
          }
        },
        update: {},
        create: {
          docenteId: docente.id,
          materiaId: materiaId,
          seccion: 'A',
          horario: 'Por definir',
          periodo: periodo.name,
          estado: 'activo',
          periodoAcademicoId: periodo.id
        }
      });
    }

    console.log('✅ Materia asignada al docente para todos los períodos');

    // 6. Verificar datos creados
    console.log('\n📋 Verificación de datos creados:');
    
    const verifyDocente = await prisma.user.findUnique({
      where: { id: docente.id },
      select: { id: true, nombre: true, email: true }
    });
    console.log('👨‍🏫 Docente:', verifyDocente);

    const verifyEstudiante = await prisma.student.findUnique({
      where: { id: estudiante.id },
      select: { id: true, nombre: true, email: true }
    });
    console.log('👨‍🎓 Estudiante:', verifyEstudiante);

    const verifyPeriodos = await prisma.periodoAcademico.findMany({
      select: { id: true, name: true, isCurrent: true }
    });
    console.log('📅 Períodos:', verifyPeriodos);

    const verifyMateria = await prisma.materia.findUnique({
      where: { id: materiaId },
      select: { id: true, nombre: true }
    });
    console.log('📚 Materia:', verifyMateria);

    console.log('\n✅ Datos de prueba creados exitosamente!');

  } catch (error) {
    console.error('❌ Error al crear datos de prueba:', error);
  } finally {
    await prisma.$disconnect();
  }
}

crearDatosPrueba();
