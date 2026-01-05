import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function unificarNombresMayusculas() {
  console.log('🔧 Unificando nombres de materias (mayúsculas/minúsculas)...');

  // Mapeo de nombres a unificar
  const mapeoNombres = [
    // Hábitos - Unificar a formato estándar
    {
      nombres: ['RESPETA AUTORIDAD', 'Respeta autoridad'],
      nombreFinal: 'Respeta autoridad'
    },
    {
      nombres: ['ATIENDE JUNTAS DE PADRES', 'Atiende junta de padres y maestros'],
      nombreFinal: 'Atiende junta de padres y maestros'
    },
    {
      nombres: ['LLEGA A TIEMPO', 'Llega a tiempo'],
      nombreFinal: 'Llega a tiempo'
    },
    {
      nombres: ['TERMINA TAREAS', 'Termina tareas'],
      nombreFinal: 'Termina tareas'
    },
    {
      nombres: ['RESPONSABLE EN CLASES', 'Responsable en Clase'],
      nombreFinal: 'Responsable en Clase'
    },
    {
      nombres: ['INTERACTÚA BIEN CON SUS COMPAÑEROS', 'Interactúa bien con sus compañeros'],
      nombreFinal: 'Interactúa bien con sus compañeros'
    },
    {
      nombres: ['ACEPTA RESPONSABILIDAD DE SUS ACCIONES', 'Acepta responsabilidad de sus acciones'],
      nombreFinal: 'Acepta responsabilidad de sus acciones'
    },
    {
      nombres: ['COMPLETA TRABAJOS A TIEMPO', 'Completa Trabajos a Tiempo'],
      nombreFinal: 'Completa Trabajos a Tiempo'
    },
    {
      nombres: ['PARTICIPA EN ACTIVIDADES DE APRENDIZAJE', 'Participa en actividades de aprendizaje'],
      nombreFinal: 'Participa en actividades de aprendizaje'
    },
    {
      nombres: ['PRÁCTICA DIARIMAENTE LO ESTUDIADO', 'Práctica diariamente lo estudiado'],
      nombreFinal: 'Práctica diariamente lo estudiado'
    },
    {
      nombres: ['PRÁCTICA VALORES MORALES DIARIAMENTE', 'Práctica Valores Morales diariamente'],
      nombreFinal: 'Práctica Valores Morales diariamente'
    },
    {
      nombres: ['PRÁCTICA SUPERVISADA', 'Práctica Supervisada'],
      nombreFinal: 'Práctica Supervisada'
    },
    {
      nombres: ['AUDITORÍA', 'Auditoría'],
      nombreFinal: 'Auditoría'
    },
    {
      nombres: ['DERECHO MERCANTIL Y N.D.L', 'Derecho Mercantil y N.D.L'],
      nombreFinal: 'Derecho Mercantil y N.D.L'
    },
    {
      nombres: ['SEMINARIO', 'Seminario'],
      nombreFinal: 'Seminario'
    },
    {
      nombres: ['BIOLOGÍA GENERAL', 'Biología General'],
      nombreFinal: 'Biología General'
    },
    {
      nombres: ['PROGRAMA DE LECTURA', 'Programa de Lectura'],
      nombreFinal: 'Programa de Lectura'
    },
    {
      nombres: ['MORAL CRISTIANA', 'Moral Cristiana'],
      nombreFinal: 'Moral Cristiana'
    },
    {
      nombres: ['RAZONAMIENTO VERBAL', 'Razonamiento Verbal'],
      nombreFinal: 'Razonamiento Verbal'
    },
    {
      nombres: ['RAZONAMIENTO MATEMÁTICO', 'Razonamiento Matemático'],
      nombreFinal: 'Razonamiento Matemático'
    },
    {
      nombres: ['MATEMÁTICA COMERCIAL', 'Matemática Comercial'],
      nombreFinal: 'Matemática Comercial'
    },
    {
      nombres: ['CONTABILIDAD BANCARIA', 'Contabilidad Bancaria'],
      nombreFinal: 'Contabilidad Bancaria'
    },
    {
      nombres: ['CONTABILIDAD GUBERNAMENTAL', 'Contabilidad Gubernamental'],
      nombreFinal: 'Contabilidad Gubernamental'
    },
    {
      nombres: ['ESTADÍSTICA COMERCIAL', 'Estadística Comercial'],
      nombreFinal: 'Estadística Comercial'
    },
    {
      nombres: ['ORGANIZACIÓN DE EMPRESAS', 'Organización de Empresas'],
      nombreFinal: 'Organización de Empresas'
    },
    {
      nombres: ['ÉTICA PROFESIONAL Y R.H', 'Ética Profesional y R.H'],
      nombreFinal: 'Ética Profesional y R.H'
    },
    {
      nombres: ['FILOSOFÍA', 'Filosofía'],
      nombreFinal: 'Filosofía'
    },
    {
      nombres: ['LENGUA Y LITERATURA', 'Lengua y Literatura'],
      nombreFinal: 'Lengua y Literatura'
    },
    {
      nombres: ['MATEMÁTICAS', 'Matemáticas'],
      nombreFinal: 'Matemáticas'
    },
    {
      nombres: ['EDUCACIÓN FÍSICA', 'Educación Física'],
      nombreFinal: 'Educación Física'
    },
    {
      nombres: ['METODOLOGÍA DE LA INVESTIGACIÓN', 'Metodología de la Investigación'],
      nombreFinal: 'Metodología de la Investigación'
    },
    {
      nombres: ['TICS', 'Tics'],
      nombreFinal: 'Tics'
    },
    {
      nombres: ['CIENCIAS SOCIALES Y FORMACIÓN CIUDADANA', 'Ciencias Sociales y Formación Ciudadana'],
      nombreFinal: 'Ciencias Sociales y Formación Ciudadana'
    },
    {
      nombres: ['PSICOLOGÍA', 'Psicología'],
      nombreFinal: 'Psicología'
    },
    {
      nombres: ['FÍSICA', 'Física'],
      nombreFinal: 'Física'
    },
    {
      nombres: ['QUÍMICA GENERAL', 'Química General'],
      nombreFinal: 'Química General'
    },
    {
      nombres: ['MECANOGRAFÍA', 'Mecanografía'],
      nombreFinal: 'Mecanografía'
    },
    {
      nombres: ['MÉTODOS DE LA INVESTIGACIÓN', 'Métodos de la Investigación'],
      nombreFinal: 'Métodos de la Investigación'
    },
    {
      nombres: ['MATEMÁTICA BÁSICA', 'Matemática Básica'],
      nombreFinal: 'Matemática Básica'
    },
    {
      nombres: ['PROGRAMACIÓN', 'Programación'],
      nombreFinal: 'Programación'
    },
    {
      nombres: ['COMPUTACIÓN', 'Computación'],
      nombreFinal: 'Computación'
    },
    {
      nombres: ['ORTOGRAFÍA Y CALIGRAFÍA', 'Ortografía y Caligrafía'],
      nombreFinal: 'Ortografía y Caligrafía'
    },
    {
      nombres: ['INTRODUCCIÓN A LA ECONOMÍA', 'Introducción a la Economía'],
      nombreFinal: 'Introducción a la Economía'
    },
    {
      nombres: ['REDACCIÓN Y CORRESPONDENCIA MERCANTIL', 'Redacción y Correspondencia Mercantil'],
      nombreFinal: 'Redacción y Correspondencia Mercantil'
    },
    {
      nombres: ['FUNDAMENTOS DE DERECHO', 'Fundamentos de Derecho'],
      nombreFinal: 'Fundamentos de Derecho'
    },
    {
      nombres: ['CONTABILIDAD DE COSTOS', 'Contabilidad de Costos'],
      nombreFinal: 'Contabilidad de Costos'
    },
    {
      nombres: ['CÁLCULO MERCANTIL Y FINANCIERO', 'Cálculo Mercantil y Financiero'],
      nombreFinal: 'Cálculo Mercantil y Financiero'
    },
    {
      nombres: ['FINANZAS PÚBLICAS', 'Finanzas Públicas'],
      nombreFinal: 'Finanzas Públicas'
    },
    {
      nombres: ['GEOGRAFÍA ECONÓMICA', 'Geografía Económica'],
      nombreFinal: 'Geografía Económica'
    },
    {
      nombres: ['CATALOGACIÓN Y ARCHIVO', 'Catalogación y Archivo'],
      nombreFinal: 'Catalogación y Archivo'
    },
    {
      nombres: ['ADMINISTRACIÓN Y ORGANIZACIÓN DE OFICINA', 'Administración y Organización de Oficina'],
      nombreFinal: 'Administración y Organización de Oficina'
    },
    {
      nombres: ['COMUNICACIÓN Y LENGUAJE L3 (INGLÉS TÉCNICO)', 'Comunicación y Lenguaje L3 (Inglés Técnico)'],
      nombreFinal: 'Comunicación y Lenguaje L3 (Inglés Técnico)'
    },
    {
      nombres: ['ELABORACIÓN Y GESTIÓN DE PROYECTOS', 'Elaboración y Gestión de Proyectos'],
      nombreFinal: 'Elaboración y Gestión de Proyectos'
    },
    {
      nombres: ['LEGISLACIÓN FISCAL Y ADUANA', 'Legislación Fiscal y Aduana'],
      nombreFinal: 'Legislación Fiscal y Aduana'
    },
    {
      nombres: ['CONTABILIDAD DE SOCIEDADES', 'Contabilidad de Sociedades'],
      nombreFinal: 'Contabilidad de Sociedades'
    },
    {
      nombres: ['INGLÉS COMERCIAL', 'Inglés Comercial'],
      nombreFinal: 'Inglés Comercial'
    },
    {
      nombres: ['GESTIÓN DE PROYECTOS', 'Gestión de Proyectos'],
      nombreFinal: 'Gestión de Proyectos'
    }
  ];

  let cambiosRealizados = 0;

  for (const mapeo of mapeoNombres) {
    // Primero, encontrar todas las materias con cualquiera de los nombres del mapeo
    const todasLasMaterias: any[] = [];
    for (const nombre of mapeo.nombres) {
      const materias = await prisma.materia.findMany({
        where: { nombre: nombre }
      });
      todasLasMaterias.push(...materias);
    }

    // Si ya existe una materia con el nombre final, conservar esa y eliminar las otras
    const materiaFinalExistente = await prisma.materia.findFirst({
      where: { nombre: mapeo.nombreFinal }
    });

    if (materiaFinalExistente) {
      // Eliminar todas las otras materias
      for (const materia of todasLasMaterias) {
        if (materia.id !== materiaFinalExistente.id) {
          console.log(`🗑️ Eliminando duplicado: "${materia.nombre}" (conservando "${mapeo.nombreFinal}")`);
          await prisma.materia.delete({
            where: { id: materia.id }
          });
          cambiosRealizados++;
        }
      }
    } else {
      // Si no existe el nombre final, tomar la primera materia y renombrarla
      if (todasLasMaterias.length > 0) {
        const materiaPrincipal = todasLasMaterias[0];
        console.log(`🔄 Actualizando: "${materiaPrincipal.nombre}" -> "${mapeo.nombreFinal}"`);
        
        await prisma.materia.update({
          where: { id: materiaPrincipal.id },
          data: { nombre: mapeo.nombreFinal }
        });

        // Eliminar las otras
        for (let i = 1; i < todasLasMaterias.length; i++) {
          const materia = todasLasMaterias[i];
          console.log(`🗑️ Eliminando duplicado: "${materia.nombre}"`);
          await prisma.materia.delete({
            where: { id: materia.id }
          });
        }

        cambiosRealizados += todasLasMaterias.length;
      }
    }
  }

  console.log(`\n✅ Unificación completada. Se realizaron ${cambiosRealizados} cambios.`);
  
  // Verificación final
  const totalMaterias = await prisma.materia.count();
  console.log(`📊 Total de materias en la base de datos: ${totalMaterias}`);
}

unificarNombresMayusculas()
  .then(() => {
    console.log('🎉 Script ejecutado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error en la ejecución del script:', error);
    process.exit(1);
  });

export { unificarNombresMayusculas };
