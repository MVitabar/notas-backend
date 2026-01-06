import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function completarGradosFaltantes() {
  console.log('🔧 Completando grados faltantes en producción...');

  try {
    // Materias que faltan por asignar grados
    const materiasFaltantes: { [key: string]: string[] } = {
      // Materias de Bachillerato/PC (4°, 5°, 6°)
      'Redacción y Correspondencia Mercantil': ['4° PC', '5° PC'],
      'Fundamentos de Derecho': ['4° PC', '5° PC'],
      'Contabilidad de Costos': ['5° PC'],
      'Matemática Básica': ['6° PC'],
      'Programación': ['6° PC'],
      'Matemática Comercial': ['4° PC'],
      'Introducción a la Economía': ['4° PC'],
      'Finanzas Públicas': ['5° PC'],
      'Administración y Organización de Oficina': ['4° PC'],
      'Legislación Fiscal y Aduana': ['5° PC'],
      'Contabilidad de Sociedades': ['4° PC'],
      'Práctica Supervisada': ['6° PC'],
      'Auditoría': ['6° PC'],
      'Derecho Mercantil y N.D.L': ['6° PC'],
      'Seminario': ['6° PC'],
      'Contabilidad Bancaria': ['6° PC'],
      'Contabilidad Gubernamental': ['6° PC'],
      'Estadística Comercial': ['6° PC'],
      'Organización de Empresas': ['6° PC'],
      'Ética Profesional y R.H': ['6° PC'],
      'Filosofía': ['4° BCL', '5° BCL'],
      'Lengua y Literatura': ['4° BCL', '5° BCL'],
      'Metodología de la Investigación': ['4° PC', '5° PC'],
      'Tics': ['4° BCL', '5° BCL'],
      'Psicología': ['4° BCL', '5° BCL'],
      'Química General': ['5° PC'],
      'Mecanografía': ['5° PC'],
      'Geografía Económica': ['5° PC'],
      'Comunicación y Lenguaje L3 (Inglés Técnico)': ['4° BCL', '5° BCL'],
      'Elaboración y Gestión de Proyectos': ['4° BCL', '5° BCL'],
      'Gestión de Proyectos': ['5° PC'],
      'Biología General': ['6° PC'],
      'Razonamiento Matemático': ['4° BCL', '5° BCL'],
      'Catalogación y Archivo': ['5° PC'],
      'Cálculo Mercantil y Financiero': ['5° PC'],
      'Inglés Comercial': ['5° PC']
    };

    // Obtener materias sin grados o con grados vacíos
    const materiasSinGrados = await prisma.materia.findMany({
      where: {
        activa: true,
        OR: [
          { grados: { isEmpty: true } },
          { grados: { equals: [] } }
        ]
      },
      select: {
        id: true,
        nombre: true,
        grados: true
      }
    });

    console.log(`\n📊 Encontradas ${materiasSinGrados.length} materias sin grados`);

    let actualizaciones = 0;
    let noEncontradas: string[] = [];

    for (const materia of materiasSinGrados) {
      const gradosCorrectos = materiasFaltantes[materia.nombre];
      
      if (gradosCorrectos) {
        console.log(`🔧 Asignando grados a: ${materia.nombre}`);
        console.log(`   Grados: [${gradosCorrectos.join(', ')}]`);
        
        await prisma.materia.update({
          where: { id: materia.id },
          data: { grados: gradosCorrectos }
        });
        
        actualizaciones++;
      } else {
        console.log(`⚠️  No se encontró mapeo para: ${materia.nombre}`);
        noEncontradas.push(materia.nombre);
      }
    }

    console.log('\n📊 Resumen:');
    console.log(`  ✅ Materias actualizadas: ${actualizaciones}`);
    console.log(`  ❌ Materias sin mapeo: ${noEncontradas.length}`);
    
    if (noEncontradas.length > 0) {
      console.log('\n⚠️  Materias sin mapeo:');
      noEncontradas.forEach(nombre => {
        console.log(`     - ${nombre}`);
      });
    }

    // Verificar estado final
    const materiasConGrados = await prisma.materia.count({
      where: {
        activa: true,
        NOT: {
          grados: { isEmpty: true }
        }
      }
    });

    const totalMaterias = await prisma.materia.count({
      where: { activa: true }
    });

    console.log('\n📈 Estado final:');
    console.log(`  📚 Total materias activas: ${totalMaterias}`);
    console.log(`  ✅ Materias con grados: ${materiasConGrados}`);
    console.log(`  📊 Porcentaje completo: ${Math.round((materiasConGrados / totalMaterias) * 100)}%`);

    console.log('\n🎉 ¡Completado de grados finalizado!');

  } catch (error) {
    console.error('❌ Error durante el completado:', error);
  }
}

completarGradosFaltantes()
  .then(() => {
    console.log('\n🎉 Script ejecutado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error en la ejecución del script:', error);
    process.exit(1);
  });

export { completarGradosFaltantes };
