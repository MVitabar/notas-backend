import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function actualizarMateriasExtracurriculares() {
  console.log('🔧 Actualizando materias extracurriculares por grado...');

  try {
    // Mapeo de materias extracurriculares por grado
    const materiasPorGrado = {
      // === PRIMERO A TERCERO DE PRIMARIA ===
      '1° Primaria': ['Comprensión de Lectura', 'Lógica Matemática'],
      '2° Primaria': ['Comprensión de Lectura', 'Lógica Matemática'],
      '3° Primaria': ['Comprensión de Lectura', 'Lógica Matemática'],
      
      // === CUARTO A SEXTO DE PRIMARIA ===
      '4° Primaria': ['Comprensión de Lectura', 'Lógica Matemática'],
      '5° Primaria': ['Comprensión de Lectura', 'Lógica Matemática'],
      '6° Primaria': ['Comprensión de Lectura', 'Lógica Matemática'],
      
      // === PRIMERO A TERCERO BÁSICO ===
      '1° Básico': ['Moral Cristiana', 'Programa de Lectura'],
      '2° Básico': ['Moral Cristiana', 'Programa de Lectura'],
      '3° Básico': ['Moral Cristiana', 'Programa de Lectura'],
      
      // === CUARTO PC ===
      '4° PC': ['Programa de Lectura', 'Moral Cristiana'],
      
      // === QUINTO PC ===
      '5° PC': ['Programa de Lectura', 'Moral Cristiana'],
      
      // === CUARTO Y QUINTO BCL ===
      '4° BCL': ['Razonamiento Verbal', 'Programa de Lectura', 'Moral Cristiana'],
      '5° BCL': ['Razonamiento Verbal', 'Programa de Lectura', 'Moral Cristiana'],
      
      // === SEXTO PC ===
      '6° PC': ['Programa de Lectura', 'Moral Cristiana']
    };

    let totalActualizadas = 0;

    // Primero, obtener todas las materias extracurriculares existentes
    const todasExtracurriculares = await prisma.materia.findMany({
      where: { esExtracurricular: true },
      select: { id: true, nombre: true, grados: true }
    });

    console.log(`📚 Materias extracurriculares encontradas: ${todasExtracurriculares.length}`);

    // Crear un mapa de nombre a materia para fácil acceso
    const materiaMap = new Map();
    todasExtracurriculares.forEach(materia => {
      materiaMap.set(materia.nombre.toLowerCase(), materia);
    });

    // Procesar cada grado
    for (const [grado, materiasExtracurriculares] of Object.entries(materiasPorGrado)) {
      console.log(`\n📚 Procesando grado: ${grado}`);
      
      for (const nombreMateria of materiasExtracurriculares) {
        // Buscar la materia (insensible a mayúsculas/minúsculas)
        let materia = materiaMap.get(nombreMateria.toLowerCase());
        
        // Si no encuentra exactamente, buscar con contains
        if (!materia) {
          materia = todasExtracurriculares.find(m => 
            m.nombre.toLowerCase().includes(nombreMateria.toLowerCase()) ||
            nombreMateria.toLowerCase().includes(m.nombre.toLowerCase())
          );
        }
        
        if (materia) {
          // Verificar si el grado ya está asignado
          if (!materia.grados.includes(grado)) {
            const nuevosGrados = [...materia.grados, grado];
            
            await prisma.materia.update({
              where: { id: materia.id },
              data: { grados: nuevosGrados }
            });
            
            console.log(`  ✅ Actualizada: ${materia.nombre} -> agregado grado: ${grado}`);
            totalActualizadas++;
            
            // Actualizar el mapa con los nuevos grados
            materia.grados = nuevosGrados;
          } else {
            console.log(`  ℹ️ El grado ${grado} ya estaba asignado a: ${materia.nombre}`);
          }
        } else {
          console.log(`  ❌ No se encontró la materia: ${nombreMateria}`);
        }
      }
    }

    // Verificación final
    console.log('\n📊 VERIFICACIÓN FINAL');
    console.log(`✅ Total de actualizaciones realizadas: ${totalActualizadas}`);
    
    // Contar materias extracurriculares por grado
    for (const [grado, materiasExtracurriculares] of Object.entries(materiasPorGrado)) {
      let count = 0;
      for (const nombreMateria of materiasExtracurriculares) {
        const materia = todasExtracurriculares.find(m => 
          m.nombre.toLowerCase().includes(nombreMateria.toLowerCase()) ||
          nombreMateria.toLowerCase().includes(m.nombre.toLowerCase())
        );
        if (materia && materia.grados.includes(grado)) {
          count++;
        }
      }
      
      console.log(`📈 ${grado}: ${count}/${materiasExtracurriculares.length} materias extracurriculares configuradas`);
    }

    // Mostrar todas las materias extracurriculares actualizadas
    console.log('\n📋 ESTADO FINAL DE MATERIAS EXTRACURRICULARES:');
    const extracurricularesActualizadas = await prisma.materia.findMany({
      where: { esExtracurricular: true },
      select: {
        nombre: true,
        grados: true,
        activa: true
      },
      orderBy: { nombre: 'asc' }
    });

    console.log(`Total: ${extracurricularesActualizadas.length} materias extracurriculares`);
    extracurricularesActualizadas.forEach(materia => {
      console.log(`  - ${materia.nombre} (${materia.grados.join(', ')}) ${materia.activa ? '✅' : '❌'}`);
    });

    console.log('\n🎉 Actualización de materias extracurriculares completada!');

  } catch (error) {
    console.error('❌ Error durante la actualización:', error);
  } finally {
    await prisma.$disconnect();
  }
}

actualizarMateriasExtracurriculares();
