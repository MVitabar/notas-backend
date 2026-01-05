import { PrismaClient, EvaluacionTipo } from '@prisma/client';

const prisma = new PrismaClient();

// Definir las clasificaciones correctas según el documento
const CLASIFICACION_CORRECTA = {
  // Materias que deben ser EXTRACURRICULAR
  EXTRACURRICULAR: [
    'Comprensión de Lectura',
    'Lógica Matemática',
    'Moral Cristiana',
    'PROGRAMA DE LECTURA',
    'RAZONAMIENTO VERBAL',
    'MORAL CRISTIANA'
  ],
  
  // Materias que deben ser tipo COMPORTAMIENTO
  COMPORTAMIENTO: [
    'Respeta autoridad',
    'Interactúa bien con sus compañeros',
    'Respeta los derechos y propiedades de otros',
    'Demuestra control de sí mismo',
    'Acepta responsabilidad de sus acciones',
    'RESPETA AUTORIDAD',
    'INTERACTÚA BIEN CON SUS COMPAÑEROS',
    'ACEPTA RESPONSABILIDAD DE SUS ACCIONES',
    'PRÁCTICA VALORES MORALES DIARIAMENTE',
    'RESPONSABLE EN CLASES',
    'COMPLETA TRABAJOS A TIEMPO',
    'PARTICIPA EN ACTIVIDADES DE APRENDIZAJE',
    'LLEGA A TIEMPO',
    'ATIENDE JUNTAS DE PADRES',
    'PRÁCTICA DIARIMAENTE LO ESTUDIADO',
    'RESPONSABLE EN CLASE',
    'Completa Trabajos a Tiempo',
    'Participa en actividades de aprendizaje',
    'Respeta Autoridad',
    'Práctica valores morales diariamente',
    'Acepta responsabilidad de sus acciones',
    'Interactúa bien con sus compañeros',
    'Llega a tiempo',
    'Respeta los derechos y propiedades de otros',
    'LLEGA A TIEMPO',
    'Atiende juntas de padres',
    'Práctica diariamente lo estudiado'
  ],
  
  // Materias que deben ser tipo CASA (Hábitos en casa)
  CASA: [
    'Llega a tiempo',
    'Viene preparado para aprender',
    'Termina tareas',
    'Lee diariamente en casa',
    'Atiende junta de padres y maestros',
    'Práctica matemáticas diariamente',
    'Práctica, vocabulario de inglés diariamente',
    'Práctica vocabulario de inglés diariamente',
    'Viene preparado para aprender',
    'Termina tareas',
    'Lee diariamente en casa',
    'Atiende junta de padres y maestros',
    'Práctica matemáticas diariamente'
  ],
  
  // Materias que deben ser tipo APRENDIZAJE
  APRENDIZAJE: [
    'Completa trabajo / asignatura, a tiempo',
    'Regresa, tareas terminadas y notas firmadas a tiempo',
    'Participa e interactúa en actividades de aprendizaje',
    'Práctica valores morales diariamente',
    'Completa trabajo / asignatura, a tiempo',
    'Regresa tareas terminadas y notas firmadas a tiempo',
    'Participa e interactúa en actividades de aprendizaje',
    'Práctica valores morales diariamente',
    'Completa trabajo / asignatura, a tiempo',
    'Regresa, tareas terminadas y notas firmadas a tiempo',
    'Participa e interactúa en actividades de aprendizaje',
    'Práctica valores morales diariamente'
  ]
};

async function corregirClasificacionMaterias() {
  console.log('🔧 Iniciando corrección de clasificación de materias...');
  
  try {
    // Obtener todos los tipos de materia
    const tiposMateria = await prisma.tipoMateria.findMany();
    const tipoMap = new Map();
    tiposMateria.forEach(tipo => {
      tipoMap.set(tipo.nombre, tipo.id);
    });
    
    console.log('📋 Tipos de materia encontrados:');
    tiposMateria.forEach(tipo => {
      console.log(`  - ${tipo.nombre}: ${tipo.id}`);
    });
    
    // Obtener todas las materias activas
    const materias = await prisma.materia.findMany({
      where: { activa: true },
      include: { tipoMateria: true }
    });
    
    console.log(`\n📚 Procesando ${materias.length} materias...`);
    
    let correcciones = 0;
    
    for (const materia of materias) {
      let nuevoTipoMateriaId: string | undefined = materia.tipoMateriaId || undefined;
      let nuevoTipo: EvaluacionTipo | undefined = undefined;
      
      // Determinar el tipo correcto según el nombre
      if (CLASIFICACION_CORRECTA.EXTRACURRICULAR.includes(materia.nombre)) {
        nuevoTipoMateriaId = tipoMap.get('EXTRACURRICULAR');
        nuevoTipo = EvaluacionTipo.EXTRACURRICULAR;
      } else if (CLASIFICACION_CORRECTA.COMPORTAMIENTO.includes(materia.nombre)) {
        nuevoTipoMateriaId = tipoMap.get('HABITO');
        nuevoTipo = EvaluacionTipo.COMPORTAMIENTO;
      } else if (CLASIFICACION_CORRECTA.CASA.includes(materia.nombre)) {
        nuevoTipoMateriaId = tipoMap.get('HOGAR');
        nuevoTipo = EvaluacionTipo.CASA;
      } else if (CLASIFICACION_CORRECTA.APRENDIZAJE.includes(materia.nombre)) {
        nuevoTipoMateriaId = tipoMap.get('HABITO');
        nuevoTipo = EvaluacionTipo.APRENDIZAJE;
      }
      
      // Si se necesita corrección
      if (nuevoTipoMateriaId && nuevoTipoMateriaId !== materia.tipoMateriaId) {
        console.log(`\n🔄 Corrigiendo materia: ${materia.nombre}`);
        console.log(`  - Tipo actual: ${materia.tipoMateria?.nombre} (${materia.tipoMateriaId})`);
        console.log(`  - Nuevo tipo: ${nuevoTipo} (${nuevoTipoMateriaId})`);
        
        // Actualizar la materia
        await prisma.materia.update({
          where: { id: materia.id },
          data: { 
            tipoMateriaId: nuevoTipoMateriaId,
            esExtracurricular: nuevoTipo === EvaluacionTipo.EXTRACURRICULAR
          }
        });
        
        // Actualizar o crear la evaluación asociada
        const evaluacionExistente = await prisma.evaluacionHabito.findFirst({
          where: { nombre: materia.nombre }
        });
        
        if (evaluacionExistente && nuevoTipo) {
          await prisma.evaluacionHabito.update({
            where: { id: evaluacionExistente.id },
            data: { tipo: nuevoTipo }
          });
          console.log(`  - ✅ Evaluación actualizada: ${evaluacionExistente.nombre} -> ${nuevoTipo}`);
        } else if (nuevoTipo) {
          await prisma.evaluacionHabito.create({
            data: {
              nombre: materia.nombre,
              descripcion: materia.descripcion || `Evaluación de ${materia.nombre}`,
              tipo: nuevoTipo,
              activo: true,
              orden: 999,
              materiaId: materia.id
            }
          });
          console.log(`  - ✅ Evaluación creada: ${materia.nombre} -> ${nuevoTipo}`);
        }
        
        correcciones++;
      }
    }
    
    console.log(`\n✅ Corrección completada. Se realizaron ${correcciones} cambios.`);
    
  } catch (error) {
    console.error('❌ Error durante la corrección:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
if (require.main === module) {
  corregirClasificacionMaterias()
    .then(() => {
      console.log('🎉 Script ejecutado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en la ejecución del script:', error);
      process.exit(1);
    });
}

export { corregirClasificacionMaterias };
