import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function verificarGradosExtracurriculares() {
  try {
    console.log('🔍 Verificando configuración de grados para extracurriculares...\n');
    
    // Configuración esperada (simplificada)
    const configuracionEsperada = {
      '1° Primaria A': ['Comprensión de Lectura', 'Lógica Matemática'],
      '1° Básico A': ['Moral Cristiana', 'Programa de Lectura'],
      '4° Bachillerato en Ciencias y Letras': ['RAZONAMIENTO VERBAL', 'PROGRAMA DE LECTURA', 'MORAL CRISTIANA']
    };
    
    // Obtener todas las extracurriculares con sus grados
    const extracurriculares = await prisma.materia.findMany({
      where: {
        activa: true,
        esExtracurricular: true
      },
      select: {
        nombre: true,
        grados: true
      }
    });
    
    console.log('📋 Verificación por grado:\n');
    
    Object.entries(configuracionEsperada).forEach(([grado, materiasEsperadas]) => {
      console.log(`🎓 Grado: ${grado}`);
      console.log(`   Materias esperadas: ${materiasEsperadas.join(', ')}`);
      
      const materiasEncontradas = extracurriculares.filter(m => 
        m.grados?.some(g => g.includes(grado.split(' ')[0] + ' ' + grado.split(' ')[1]))
      );
      
      console.log(`   Materias encontradas: ${materiasEncontradas.map(m => m.nombre).join(', ') || 'NINGUNA'}`);
      
      // Verificar coincidencias
      const coincidencias = materiasEsperadas.filter(esperada => 
        materiasEncontradas.some(encontrada => encontrada.nombre === esperada)
      );
      
      const faltantes = materiasEsperadas.filter(esperada => 
        !materiasEncontradas.some(encontrada => encontrada.nombre === esperada)
      );
      
      console.log(`   ✅ Coincidencias: ${coincidencias.join(', ') || 'NINGUNA'}`);
      console.log(`   ❌ Faltantes: ${faltantes.join(', ') || 'NINGUNA'}`);
      console.log('');
    });
    
    // Verificar problemas específicos
    console.log('🚨 Problemas identificados:');
    
    // 1. Duplicados con diferentes mayúsculas
    console.log('   1. Duplicados con mayúsculas:');
    console.log('      - Programa de Lectura vs PROGRAMA DE LECTURA');
    console.log('      - Moral Cristiana vs MORAL CRISTIANA');
    console.log('      - RAZONAMIENTO VERBAL (solo mayúsculas)');
    
    // 2. Grados que no coinciden con la configuración
    const moralCristiana = extracurriculares.find(m => m.nombre === 'Moral Cristiana');
    if (moralCristiana && !moralCristiana.grados?.includes('1° Básico')) {
      console.log('   2. Moral Cristiana no está configurada para 1° Básico');
      console.log(`      Grados actuales: [${moralCristiana.grados?.join(', ')}]`);
    }
    
    // 3. Materias con grados incorrectos
    console.log('   3. Materias con grados posiblemente incorrectos:');
    extracurriculares.forEach(m => {
      if (m.nombre.includes('RAZONAMIENTO') || m.nombre.includes('PROGRAMA') || m.nombre.includes('MORAL')) {
        if (m.grados?.length === 2 && m.grados.includes('4° BCL')) {
          console.log(`      - ${m.nombre}: Solo está en [${m.grados?.join(', ')}]`);
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarGradosExtracurriculares();
