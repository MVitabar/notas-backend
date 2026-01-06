import { PrismaClient, EvaluacionTipo } from '@prisma/client';

const prisma = new PrismaClient();

async function importarTodasEvaluaciones() {
  try {
    console.log('📥 Importando evaluaciones para todas las materias...');

    // Mapear los strings a los tipos del enum
    const tipoMap: Record<string, EvaluacionTipo> = {
      'CASA': EvaluacionTipo.CASA,
      'COMPORTAMIENTO': EvaluacionTipo.COMPORTAMIENTO,
      'EXTRACURRICULAR': EvaluacionTipo.EXTRACURRICULAR,
      'APRENDIZAJE': EvaluacionTipo.APRENDIZAJE
    };

    // Obtener todas las materias existentes
    const materiasExistentes = await prisma.materia.findMany({
      select: {
        id: true,
        nombre: true,
        tipoMateriaId: true
      },
      orderBy: {
        nombre: 'asc'
      }
    });

    console.log(`📚 Materias existentes: ${materiasExistentes.length}`);

    // Datos de evaluaciones proporcionados por el usuario - usando nombres en lugar de IDs
    const evaluacionesData = [
      // CASA
      { nombre: 'Lee diariamente en casa', descripcion: 'Evaluación de Lee diariamente en casa', tipo: 'CASA', orden: 999, activo: true },
      { nombre: 'Viene preparado para aprender', descripcion: 'Evaluación de Viene preparado para aprender', tipo: 'CASA', orden: 999, activo: true },
      { nombre: 'Práctica vocabulario de inglés diariamente', descripcion: 'Evaluación de Práctica vocabulario de inglés diariamente', tipo: 'CASA', orden: 999, activo: true },
      { nombre: 'Termina tareas', descripcion: 'Evaluación de Termina tareas', tipo: 'CASA', orden: 999, activo: true },
      
      // COMPORTAMIENTO
      { nombre: 'Responsable en Clase', descripcion: 'Evaluación de Responsable en Clase', tipo: 'COMPORTAMIENTO', orden: 999, activo: true },
      { nombre: 'Práctica valores morales diariamente', descripcion: 'Evaluación de Práctica valores morales diariamente', tipo: 'COMPORTAMIENTO', orden: 999, activo: true },
      { nombre: 'ATIENDE JUNTAS DE PADRES', descripcion: 'Evaluación de ATIENDE JUNTAS DE PADRES', tipo: 'COMPORTAMIENTO', orden: 999, activo: true },
      { nombre: 'Completa Trabajos a Tiempo', descripcion: 'Evaluación de Completa Trabajos a Tiempo', tipo: 'COMPORTAMIENTO', orden: 999, activo: true },
      { nombre: 'INTERACTÚA BIEN CON SUS COMPAÑEROS', descripcion: 'Evaluación de Interactúa bien con sus compañeros', tipo: 'COMPORTAMIENTO', orden: 999, activo: true },
      { nombre: 'Respeta los derechos y propiedades de otros', descripcion: 'Evaluación de Respeta los derechos y propiedades de otros', tipo: 'COMPORTAMIENTO', orden: 999, activo: true },
      { nombre: 'Demuestra control de sí mismo', descripcion: 'Evaluación de Demuestra control de sí mismo', tipo: 'COMPORTAMIENTO', orden: 999, activo: true },
      { nombre: 'LLEGA A TIEMPO', descripcion: 'Evaluación de LLEGA A TIEMPO', tipo: 'COMPORTAMIENTO', orden: 999, activo: true },
      { nombre: 'RAZONAMIENTO VERBAL', descripcion: 'Evaluación de RAZONAMIENTO VERBAL', tipo: 'COMPORTAMIENTO', orden: 999, activo: true },
      { nombre: 'Práctica diariamente lo estudiado', descripcion: 'Evaluación de Práctica diariamente lo estudiado', tipo: 'COMPORTAMIENTO', orden: 999, activo: true },
      { nombre: 'Interactúa bien con sus compañeros', descripcion: 'Evaluación de Interactúa bien con sus compañeros', tipo: 'COMPORTAMIENTO', orden: 999, activo: true },
      { nombre: 'Participa en actividades de aprendizaje', descripcion: 'Evaluación de Participa en actividades de aprendizaje', tipo: 'COMPORTAMIENTO', orden: 999, activo: true },
      
      // EXTRACURRICULAR
      { nombre: 'Lógica Matemática', descripcion: 'Evaluación de Lógica Matemática', tipo: 'EXTRACURRICULAR', orden: 999, activo: true },
      { nombre: 'PROGRAMA DE LECTURA', descripcion: 'Evaluación de PROGRAMA DE LECTURA', tipo: 'EXTRACURRICULAR', orden: 999, activo: true },
      { nombre: 'RAZONAMIENTO VERBAL', descripcion: 'Evaluación de RAZONAMIENTO VERBAL', tipo: 'EXTRACURRICULAR', orden: 999, activo: true },
      { nombre: 'MORAL CRISTIANA', descripcion: 'Evaluación de MORAL CRISTIANA', tipo: 'EXTRACURRICULAR', orden: 999, activo: true },
      { nombre: 'Práctica Valores Morales diariamente', descripcion: 'Evaluación de Práctica Valores Morales diariamente', tipo: 'COMPORTAMIENTO', orden: 999, activo: true },
      { nombre: 'Acepta responsabilidad de sus acciones', descripcion: 'Evaluación de Acepta responsabilidad de sus acciones', tipo: 'COMPORTAMIENTO', orden: 999, activo: true },
      
      // APRENDIZAJE
      { nombre: 'Completa trabajo / asignatura, a tiempo', descripcion: 'Evaluación de Completa trabajo / asignatura, a tiempo', tipo: 'APRENDIZAJE', orden: 999, activo: true },
      { nombre: 'Comprensión de Lectura', descripcion: 'Evaluación de Comprensión de Lectura', tipo: 'APRENDIZAJE', orden: 999, activo: true },
      { nombre: 'Regresa tareas terminadas y notas firmadas a tiempo', descripcion: 'Evaluación de Regresa tareas terminadas y notas firmadas a tiempo', tipo: 'APRENDIZAJE', orden: 999, activo: true }
    ];

    console.log(`📊 Procesando ${evaluacionesData.length} evaluaciones...`);

    let creadas = 0;
    let actualizadas = 0;
    let errores = 0;

    for (const [index, evalData] of evaluacionesData.entries()) {
      try {
        // Buscar la materia existente por nombre
        const materiaExistente = materiasExistentes.find(m => m.nombre === evalData.nombre);
        
        if (!materiaExistente) {
          console.log(`⚠️ Materia no encontrada: ${evalData.nombre}`);
          errores++;
          continue;
        }

        // Verificar si ya existe la evaluación
        const existente = await prisma.evaluacionHabito.findFirst({
          where: { 
            nombre: evalData.nombre,
            tipo: tipoMap[evalData.tipo]
          }
        });

        if (existente) {
          // Actualizar si existe
          await prisma.evaluacionHabito.update({
            where: { id: existente.id },
            data: {
              nombre: evalData.nombre,
              descripcion: evalData.descripcion,
              tipo: tipoMap[evalData.tipo],
              orden: evalData.orden,
              activo: evalData.activo,
              materiaId: materiaExistente.id
            }
          });
          console.log(`✅ ${index + 1}. Actualizada: ${evalData.nombre} (${evalData.tipo})`);
          actualizadas++;
        } else {
          // Crear si no existe
          await prisma.evaluacionHabito.create({
            data: {
              nombre: evalData.nombre,
              descripcion: evalData.descripcion,
              tipo: tipoMap[evalData.tipo],
              orden: evalData.orden,
              activo: evalData.activo,
              materiaId: materiaExistente.id
            }
          });
          console.log(`✅ ${index + 1}. Creada: ${evalData.nombre} (${evalData.tipo})`);
          creadas++;
        }
      } catch (error) {
        console.error(`❌ ${index + 1}. Error con ${evalData.nombre}:`, error.message);
        errores++;
      }
    }

    console.log(`\n📊 Resumen de la importación:`);
    console.log(`✅ Creadas: ${creadas}`);
    console.log(`🔄 Actualizadas: ${actualizadas}`);
    console.log(`❌ Errores: ${errores}`);
    console.log(`📈 Total procesadas: ${creadas + actualizadas}`);

    // Verificar el resultado
    const totalEvaluaciones = await prisma.evaluacionHabito.count();
    console.log(`\n📊 Total de evaluaciones en la base de datos: ${totalEvaluaciones}`);

    console.log('\n✅ Importación completada!');

  } catch (error) {
    console.error('❌ Error durante la importación:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importarTodasEvaluaciones();
