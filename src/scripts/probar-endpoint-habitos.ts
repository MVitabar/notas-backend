import { PrismaClient } from '@prisma/client';
import { CalificacionHabitoService } from '../calificaciones/calificacion-habito.service';
import { PrismaExtendedService } from '../prisma/prisma-extended.service';
import { PeriodoUnidadService } from '../academic-period/periodo-unidad.service';
import { PrismaService } from '../prisma/prisma.service';

const prisma = new PrismaExtendedService();
const prismaService = new PrismaService();
const periodoUnidadService = new PeriodoUnidadService(prismaService);

// Initialize the connections
prisma.onModuleInit().catch(console.error);
prismaService.onModuleInit().catch(console.error);

async function probarEndpointHabitos() {
  console.log('🧪 Probando endpoint de hábitos por estudiante...');

  // 1. Obtener un estudiante de prueba
  const estudiante = await prisma.student.findFirst({
    select: {
      id: true,
      nombre: true,
      apellido: true,
      grados: true
    }
  });

  if (!estudiante) {
    console.log('❌ No se encontró ningún estudiante');
    return;
  }

  console.log(`\n👤 Estudiante seleccionado: ${estudiante.nombre} ${estudiante.apellido}`);
  console.log(`🎓 Grados: [${estudiante.grados.join(', ')}]`);

  // 2. Obtener un período activo
  const periodo = await prisma.periodoAcademico.findFirst({
    where: { isCurrent: true }
  });

  if (!periodo) {
    console.log('❌ No se encontró ningún período activo');
    return;
  }

  console.log(`📅 Período: ${periodo.name} (${periodo.id})`);

  // 3. Probar el servicio directamente
  const calificacionService = new CalificacionHabitoService(prisma, periodoUnidadService);

  try {
    console.log('\n🔄 Llamando al servicio obtenerCalificacionesPorEstudiante...');
    
    const resultado = await calificacionService.obtenerCalificacionesPorEstudiante(
      estudiante.id,
      periodo.id
    );

    console.log(`\n📊 Resultado obtenido (${resultado.length} hábitos):`);
    
    resultado.forEach((habito, index) => {
      console.log(`\n${index + 1}. ${habito.nombre}`);
      console.log(`   📝 Tipo: ${habito.tipo}`);
      console.log(`   🎯 Evaluación ID: ${habito.evaluacionHabitoId}`);
      console.log(`   📚 Tipo Materia ID: ${habito.tipoMateriaId || 'N/A'}`);
      console.log(`   📊 Calificaciones: ${habito.calificaciones?.length || 0}`);
      console.log(`   ✅ Es materia: ${habito.esMateria}`);
      
      if (habito.calificaciones && habito.calificaciones.length > 0) {
        const calif = habito.calificaciones[0];
        console.log(`   📈 Última calificación: U1=${calif.u1}, U2=${calif.u2}, U3=${calif.u3}, U4=${calif.u4}`);
      }
    });

    // 4. Analizar los resultados
    const habitosPorTipo = resultado.reduce((acc, habito) => {
      acc[habito.tipo] = (acc[habito.tipo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log(`\n📈 Resumen por tipo:`);
    Object.entries(habitosPorTipo).forEach(([tipo, cantidad]) => {
      console.log(`  - ${tipo}: ${cantidad}`);
    });

    // 5. Verificar si hay hábitos que deberían mostrarse pero no se muestran
    const habitosMostrados = resultado.filter(h => h.esMateria);
    console.log(`\n✅ Hábitos que se mostrarán en dashboard: ${habitosMostrados.length}/${resultado.length}`);

  } catch (error) {
    console.error('❌ Error al probar el servicio:', error);
  }
}

probarEndpointHabitos()
  .then(() => {
    console.log('\n🎉 Script ejecutado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error en la ejecución del script:', error);
    process.exit(1);
  });

export { probarEndpointHabitos };
