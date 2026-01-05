import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function actualizarExtracurriculares() {
  try {
    console.log('🔧 Actualizando materias extracurriculares...\n');

    // 1. Actualizar PROGRAMA DE LECTURA para Bachillerato
    const programaLectura = await prisma.materia.update({
      where: { nombre: 'PROGRAMA DE LECTURA' },
      data: {
        grados: [
          '4° Bachillerato en Ciencias y Letras',
          '5° Bachillerato en Ciencias y Letras',
          '4° Perito Contador',
          '5° Perito Contador',
          '6° Perito Contador'
        ]
      }
    });
    console.log('✅ PROGRAMA DE LECTURA actualizado para Bachillerato');

    // 2. Actualizar MORAL CRISTIANA para Bachillerato
    const moralCristiana = await prisma.materia.update({
      where: { nombre: 'MORAL CRISTIANA' },
      data: {
        grados: [
          '4° Bachillerato en Ciencias y Letras',
          '5° Bachillerato en Ciencias y Letras',
          '4° Perito Contador',
          '5° Perito Contador',
          '6° Perito Contador'
        ]
      }
    });
    console.log('✅ MORAL CRISTIANA actualizada para Bachillerato');

    // 3. Actualizar RAZONAMIENTO VERBAL para Bachillerato
    const razonamientoVerbal = await prisma.materia.update({
      where: { nombre: 'RAZONAMIENTO VERBAL' },
      data: {
        grados: [
          '4° Bachillerato en Ciencias y Letras',
          '5° Bachillerato en Ciencias y Letras'
        ]
      }
    });
    console.log('✅ RAZONAMIENTO VERBAL actualizado para Bachillerato');

    // 4. Actualizar Programa de Lectura (minúsculas) para quitar Bachillerato
    const programaLecturaMinusculas = await prisma.materia.update({
      where: { nombre: 'Programa de Lectura' },
      data: {
        grados: [
          '1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria',
          '1° Básico', '2° Básico', '3° Básico',
          '4° PC', '5° PC', '6° PC'
        ]
      }
    });
    console.log('✅ Programa de Lectura actualizado para Primaria y Básicos');

    // 5. Actualizar Moral Cristiana (minúsculas) para quitar Bachillerato
    const moralCristianaMinusculas = await prisma.materia.update({
      where: { nombre: 'Moral Cristiana' },
      data: {
        grados: [
          '1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria',
          '1° Básico', '2° Básico', '3° Básico',
          '4° PC', '5° PC', '6° PC'
        ]
      }
    });
    console.log('✅ Moral Cristiana actualizada para Primaria y Básicos');

    console.log('\n🎉 ¡Actualización completada!\n');

    // Verificación final
    console.log('📋 Verificación final:');
    const verificacion = await prisma.materia.findMany({
      where: {
        activa: true,
        esExtracurricular: true
      },
      select: {
        nombre: true,
        grados: true
      },
      orderBy: { nombre: 'asc' }
    });

    verificacion.forEach(m => {
      if (m.nombre.includes('PROGRAMA') || m.nombre.includes('MORAL') || m.nombre.includes('RAZONAMIENTO')) {
        console.log(`\n🔹 ${m.nombre}:`);
        console.log(`   Grados: [${m.grados?.join(', ')}]`);
      }
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

actualizarExtracurriculares();
