import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function asignarGradosFinales() {
  console.log('🔧 Asignando grados a las materias restantes...');

  // Asignar grados a las materias que no tienen
  const asignaciones = [
    {
      nombre: 'Expresión Artística (Música)',
      grados: ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria']
    },
    {
      nombre: 'Inglés',
      grados: ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria', '1° Básico', '2° Básico', '3° Básico', '4° PC', '5° PC', '6° PC']
    },
    {
      nombre: 'Práctica vocabulario de inglés diariamente',
      grados: ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria']
    }
  ];

  let actualizadas = 0;

  for (const asignacion of asignaciones) {
    const materia = await prisma.materia.findFirst({
      where: { nombre: asignacion.nombre }
    });

    if (materia) {
      console.log(`🔄 Actualizando "${asignacion.nombre}" con ${asignacion.grados.length} grados`);
      
      await prisma.materia.update({
        where: { id: materia.id },
        data: { grados: asignacion.grados }
      });

      actualizadas++;
      console.log(`✅ "${asignacion.nombre}" actualizada correctamente`);
    } else {
      console.log(`⚠️ No se encontró la materia: "${asignacion.nombre}"`);
    }
  }

  console.log(`\n✅ Se asignaron grados a ${actualizadas} materias`);

  // Verificación final
  const materiasSinGrados = await prisma.materia.findMany({
    where: {
      grados: {
        isEmpty: true
      }
    }
  });

  const totalMaterias = await prisma.materia.count();
  const materiasConGrados = totalMaterias - materiasSinGrados.length;

  console.log(`\n📊 ESTADO FINAL:`);
  console.log(`✅ Materias con grados asignados: ${materiasConGrados}`);
  console.log(`⚠️ Materias sin grados: ${materiasSinGrados.length}`);
  console.log(`📚 Total materias activas: ${totalMaterias}`);
  console.log(`📈 Porcentaje completo: ${Math.round((materiasConGrados / totalMaterias) * 100)}%`);

  if (materiasSinGrados.length > 0) {
    console.log(`\n⚠️ Materias que aún no tienen grados:`);
    materiasSinGrados.forEach(m => {
      console.log(`  - ${m.nombre}`);
    });
  } else {
    console.log(`\n🎉 ¡Todas las materias tienen grados asignados!`);
  }
}

asignarGradosFinales()
  .then(() => {
    console.log('🎉 Script ejecutado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error en la ejecución del script:', error);
    process.exit(1);
  });

export { asignarGradosFinales };
