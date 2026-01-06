import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function asignarGradosFaltantes() {
  console.log('🔧 Asignando grados a materias faltantes...');

  try {
    // Mapeo de las materias faltantes
    const materiasFaltantesMap: { [key: string]: string[] } = {
      // === PROGRAMAS Y LENGUAJES ===
      'Programa de Lectura': ['1° Básico', '2° Básico', '3° Básico', '4° PC', '5° PC', '6° PC', '4° BCL', '5° BCL'],
      'Inglés': ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria'],
      
      // === PERITO CONTADOR (PC) ===
      'Derecho Mercantil y N.D.L': ['4° PC', '5° PC', '6° PC'],
      'Razonamiento Matemático': ['4° BCL', '5° BCL'],
      'Matemática Comercial': ['4° PC', '5° PC', '6° PC'],
      'Contabilidad Bancaria': ['4° PC', '5° PC', '6° PC'],
      'Ética Profesional y R.H': ['4° PC', '5° PC', '6° PC'],
      'Metodología de la Investigación': ['4° BCL', '5° BCL'],
      'Psicología': ['4° BCL', '5° BCL'],
      'Mecanografía': ['4° PC', '5° PC', '6° PC'],
      'Matemática Básica': ['4° PC', '5° PC', '6° PC'],
      'Redacción y Correspondencia Mercantil': ['4° PC', '5° PC', '6° PC'],
      'Fundamentos de Derecho': ['4° PC', '5° PC', '6° PC'],
      'Catalogación y Archivo': ['4° PC', '5° PC', '6° PC'],
      'Gestión de Proyectos': ['4° PC', '5° PC', '6° PC', '4° BCL', '5° BCL'],
      'Seminario': ['4° PC', '5° PC', '6° PC'],
      'Razonamiento Verbal': ['4° BCL', '5° BCL'],
      'Contabilidad Gubernamental': ['4° PC', '5° PC', '6° PC'],
      'Organización de Empresas': ['4° PC', '5° PC', '6° PC'],
      'Filosofía': ['4° BCL', '5° BCL'],
      'Ciencias Sociales y Formación Ciudadana': ['4° PC', '5° PC', '6° PC'],
      'Métodos de la Investigación': ['4° PC', '5° PC', '6° PC'],
      'Ortografía y Caligrafía': ['4° PC', '5° PC', '6° PC'],
      'Introducción a la Economía': ['4° PC', '5° PC', '6° PC'],
      'Contabilidad de Costos': ['4° PC', '5° PC', '6° PC'],
      'Finanzas Públicas': ['4° PC', '5° PC', '6° PC'],
      'Administración y Organización de Oficina': ['4° PC', '5° PC', '6° PC'],
      'Contabilidad de Sociedades': ['4° PC', '5° PC', '6° PC'],
      'Práctica Supervisada': ['4° PC', '5° PC', '6° PC'],
      'Auditoría': ['4° PC', '5° PC', '6° PC'],
      'Biología General': ['4° PC', '5° PC', '6° PC'],
      'Estadística Comercial': ['4° PC', '5° PC', '6° PC'],
      'Tics': ['4° BCL', '5° BCL'],
      'Química General': ['4° PC', '5° PC', '6° PC'],
      'Programación': ['4° PC', '5° PC', '6° PC'],
      'Elaboración y Gestión de Proyectos': ['4° BCL', '5° BCL'],
      'Legislación Fiscal y Aduana': ['4° PC', '5° PC', '6° PC'],
      
      // === BACHILLERATO CIENCIAS Y LETRAS (BCL) ===
      'Lengua y Literatura': ['4° BCL', '5° BCL'],
      'Física': ['4° PC', '5° PC', '6° PC', '4° BCL', '5° BCL'],
      'Cálculo Mercantil y Financiero': ['4° PC', '5° PC', '6° PC'],
      'Geografía Económica': ['4° PC', '5° PC', '6° PC'],
      'Comunicación y Lenguaje L3 (Inglés Técnico)': ['4° BCL', '5° BCL'],
      'Inglés Comercial': ['4° PC', '5° PC', '6° PC']
    };

    // Obtener las materias que necesitan actualización
    const nombresFaltantes = Object.keys(materiasFaltantesMap);
    
    const materias = await prisma.materia.findMany({
      where: {
        nombre: {
          in: nombresFaltantes
        }
      },
      select: {
        id: true,
        nombre: true,
        grados: true
      }
    });

    console.log(`📚 Materias faltantes encontradas: ${materias.length}`);

    let actualizadas = 0;

    for (const materia of materias) {
      const gradosAsignar = materiasFaltantesMap[materia.nombre];
      
      if (gradosAsignar) {
        await prisma.materia.update({
          where: { id: materia.id },
          data: {
            grados: gradosAsignar
          }
        });
        console.log(`✅ ${materia.nombre}: [${gradosAsignar.join(', ')}]`);
        actualizadas++;
      }
    }

    console.log(`\n📊 Resumen:`);
    console.log(`✅ Materias actualizadas: ${actualizadas}`);
    console.log(`📈 Total procesadas: ${materias.length}`);

    // Verificar cuántas materias siguen sin grados
    const materiasSinGrados = await prisma.materia.count({
      where: {
        grados: {
          equals: []
        }
      }
    });

    console.log(`\n📊 Materias que aún no tienen grados: ${materiasSinGrados}`);

    if (materiasSinGrados > 0) {
      console.log('\n📝 Materias que aún necesitan asignación manual:');
      const sinGrados = await prisma.materia.findMany({
        where: {
          grados: {
            equals: []
          }
        },
        select: {
          nombre: true
        }
      });
      
      sinGrados.forEach(m => {
        console.log(`  - ${m.nombre}`);
      });
    }

    console.log('\n🎉 Asignación de grados faltantes completada!');

  } catch (error) {
    console.error('❌ Error durante la asignación de grados:', error);
  } finally {
    await prisma.$disconnect();
  }
}

asignarGradosFaltantes();
