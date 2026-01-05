import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function sincronizarMateriasFaltantes() {
  console.log('🔧 Sincronizando materias faltantes de producción...');

  // Materias que existen en producción pero no localmente
  const materiasFaltantes = [
    {
      nombre: 'Demuestra control de sí mismo',
      descripcion: '',
      codigo: 'MAT-018',
      creditos: 1,
      activa: true,
      esExtracurricular: false,
      orden: 18,
      tipoMateriaId: '1af761d9-37cd-4527-96b9-12a0235eae40', // HABITO
      grados: ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria']
    },
    {
      nombre: 'Danza',
      descripcion: '',
      codigo: 'MAT-043',
      creditos: 1,
      activa: true,
      esExtracurricular: false,
      orden: 43,
      tipoMateriaId: 'fdf9d12b-c537-4e30-8ef5-0023367293d3', // ACADEMICA
      grados: ['1° Básico', '2° Básico', '3° Básico']
    },
    {
      nombre: 'Educación Musical',
      descripcion: '',
      codigo: 'MAT-040',
      creditos: 1,
      activa: true,
      esExtracurricular: false,
      orden: 40,
      tipoMateriaId: 'fdf9d12b-c537-4e30-8ef5-0023367293d3', // ACADEMICA
      grados: ['1° Básico', '2° Básico', '3° Básico']
    },
    {
      nombre: 'Artes Visuales',
      descripcion: '',
      codigo: 'MAT-041',
      creditos: 1,
      activa: true,
      esExtracurricular: false,
      orden: 41,
      tipoMateriaId: 'fdf9d12b-c537-4e30-8ef5-0023367293d3', // ACADEMICA
      grados: ['1° Básico', '2° Básico', '3° Básico']
    },
    {
      nombre: 'Teatro',
      descripcion: '',
      codigo: 'MAT-042',
      creditos: 1,
      activa: true,
      esExtracurricular: false,
      orden: 42,
      tipoMateriaId: 'fdf9d12b-c537-4e30-8ef5-0023367293d3', // ACADEMICA
      grados: ['1° Básico', '2° Básico', '3° Básico']
    },
    {
      nombre: 'Emprendimiento para la productividad',
      descripcion: '',
      codigo: 'MAT-044',
      creditos: 1,
      activa: true,
      esExtracurricular: false,
      orden: 44,
      tipoMateriaId: 'fdf9d12b-c537-4e30-8ef5-0023367293d3', // ACADEMICA
      grados: ['1° Básico', '2° Básico', '3° Básico']
    },
    {
      nombre: 'Tecnologías del Aprendizaje y la Comunicación',
      descripcion: '',
      codigo: 'MAT-045',
      creditos: 1,
      activa: true,
      esExtracurricular: false,
      orden: 45,
      tipoMateriaId: 'fdf9d12b-c537-4e30-8ef5-0023367293d3', // ACADEMICA
      grados: ['1° Básico', '2° Básico', '3° Básico']
    },
    {
      nombre: 'Programa de Lectura',
      descripcion: '',
      codigo: 'MAT-046',
      creditos: 0,
      activa: true,
      esExtracurricular: true,
      orden: 46,
      tipoMateriaId: '115d7e9a-992a-44fe-8348-d7804c0d2155', // EXTRACURRICULAR
      grados: ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria', '1° Básico', '2° Básico', '3° Básico', '4° PC', '5° PC', '6° PC']
    },
    {
      nombre: 'Moral Cristiana',
      descripcion: '',
      codigo: 'MAT-011',
      creditos: 0,
      activa: true,
      esExtracurricular: true,
      orden: 11,
      tipoMateriaId: '115d7e9a-992a-44fe-8348-d7804c0d2155', // EXTRACURRICULAR
      grados: ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria', '1° Básico', '2° Básico', '3° Básico', '4° PC', '5° PC', '6° PC']
    },
    {
      nombre: 'Razonamiento Verbal',
      descripcion: '',
      codigo: 'MAT-100',
      creditos: 0,
      activa: true,
      esExtracurricular: true,
      orden: 100,
      tipoMateriaId: '115d7e9a-992a-44fe-8348-d7804c0d2155', // EXTRACURRICULAR
      grados: ['4° Bachillerato en Ciencias y Letras', '5° Bachillerato en Ciencias y Letras']
    },
    {
      nombre: 'Lógica Matemática',
      descripcion: '',
      codigo: 'MAT-014',
      creditos: 0,
      activa: true,
      esExtracurricular: true,
      orden: 14,
      tipoMateriaId: '115d7e9a-992a-44fe-8348-d7804c0d2155', // EXTRACURRICULAR
      grados: ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria']
    },
    {
      nombre: 'Comprensión de Lectura',
      descripcion: '',
      codigo: 'MAT-013',
      creditos: 0,
      activa: true,
      esExtracurricular: true,
      orden: 13,
      tipoMateriaId: '115d7e9a-992a-44fe-8348-d7804c0d2155', // EXTRACURRICULAR
      grados: ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria']
    }
  ];

  let creadas = 0;
  let actualizadas = 0;

  for (const materia of materiasFaltantes) {
    // Verificar si ya existe
    const existente = await prisma.materia.findFirst({
      where: { nombre: materia.nombre }
    });

    if (existente) {
      // Actualizar si existe pero con diferentes datos
      console.log(`🔄 Actualizando materia existente: "${materia.nombre}"`);
      
      await prisma.materia.update({
        where: { id: existente.id },
        data: {
          descripcion: materia.descripcion,
          codigo: materia.codigo,
          creditos: materia.creditos,
          activa: materia.activa,
          esExtracurricular: materia.esExtracurricular,
          orden: materia.orden,
          tipoMateriaId: materia.tipoMateriaId,
          grados: materia.grados
        }
      });
      
      actualizadas++;
    } else {
      // Crear nueva
      console.log(`➕ Creando materia: "${materia.nombre}"`);
      
      await prisma.materia.create({
        data: {
          nombre: materia.nombre,
          descripcion: materia.descripcion,
          codigo: materia.codigo,
          creditos: materia.creditos,
          activa: materia.activa,
          esExtracurricular: materia.esExtracurricular,
          orden: materia.orden,
          tipoMateriaId: materia.tipoMateriaId,
          grados: materia.grados
        }
      });
      
      creadas++;
    }
  }

  console.log(`\n✅ Proceso completado:`);
  console.log(`📝 Materias creadas: ${creadas}`);
  console.log(`🔄 Materias actualizadas: ${actualizadas}`);

  // Verificación final
  const totalMaterias = await prisma.materia.count();
  const materiasConGrados = await prisma.materia.count({
    where: {
      grados: {
        isEmpty: false
      }
    }
  });

  console.log(`\n📊 Estado final:`);
  console.log(`📚 Total materias: ${totalMaterias}`);
  console.log(`✅ Materias con grados: ${materiasConGrados}`);
  console.log(`⚠️ Materias sin grados: ${totalMaterias - materiasConGrados}`);
  console.log(`📈 Porcentaje completo: ${Math.round((materiasConGrados / totalMaterias) * 100)}%`);
}

sincronizarMateriasFaltantes()
  .then(() => {
    console.log('🎉 Script ejecutado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error en la ejecución del script:', error);
    process.exit(1);
  });

export { sincronizarMateriasFaltantes };
