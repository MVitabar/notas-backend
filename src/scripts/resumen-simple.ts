import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resumenFinalClasificacion() {
  console.log('📊 RESUMEN FINAL DE CLASIFICACIÓN DE MATERIAS EXTRACURRICULARES\n');

  try {
    const extracurriculares = await prisma.materia.findMany({
      where: { esExtracurricular: true },
      select: {
        nombre: true,
        grados: true,
        activa: true
      },
      orderBy: { nombre: 'asc' }
    });

    console.log('🎓 PRIMERO A TERCERO DE PRIMARIA:');
    console.log('   Grados: 1° Primaria, 2° Primaria, 3° Primaria');
    console.log('   Materias extracurriculares:');
    
    const primaria123 = extracurriculares.filter(m => 
      m.grados.includes('1° Primaria') || 
      m.grados.includes('2° Primaria') || 
      m.grados.includes('3° Primaria')
    );
    
    primaria123.forEach(m => {
      const gradosFiltrados = m.grados.filter(g => 
        g.includes('1° Primaria') || 
        g.includes('2° Primaria') || 
        g.includes('3° Primaria')
      );
      console.log(`   ✅ ${m.nombre} (${gradosFiltrados.join(', ')})`);
    });

    console.log('\n🎓 CUARTO A SEXTO DE PRIMARIA:');
    console.log('   Grados: 4° Primaria, 5° Primaria, 6° Primaria');
    console.log('   Materias extracurriculares:');
    
    const primaria456 = extracurriculares.filter(m => 
      m.grados.includes('4° Primaria') || 
      m.grados.includes('5° Primaria') || 
      m.grados.includes('6° Primaria')
    );
    
    primaria456.forEach(m => {
      const gradosFiltrados = m.grados.filter(g => 
        g.includes('4° Primaria') || 
        g.includes('5° Primaria') || 
        g.includes('6° Primaria')
      );
      console.log(`   ✅ ${m.nombre} (${gradosFiltrados.join(', ')})`);
    });

    console.log('\n🎓 PRIMERO A TERCERO BÁSICO:');
    console.log('   Grados: 1° Básico, 2° Básico, 3° Básico');
    console.log('   Materias extracurriculares:');
    
    const basico123 = extracurriculares.filter(m => 
      m.grados.includes('1° Básico') || 
      m.grados.includes('2° Básico') || 
      m.grados.includes('3° Básico')
    );
    
    basico123.forEach(m => {
      const gradosFiltrados = m.grados.filter(g => 
        g.includes('1° Básico') || 
        g.includes('2° Básico') || 
        g.includes('3° Básico')
      );
      console.log(`   ✅ ${m.nombre} (${gradosFiltrados.join(', ')})`);
    });

    console.log('\n🎓 CUARTO PC:');
    console.log('   Grados: 4° PC');
    console.log('   Materias extracurriculares:');
    
    const pc4 = extracurriculares.filter(m => m.grados.includes('4° PC'));
    pc4.forEach(m => {
      const gradosFiltrados = m.grados.filter(g => g.includes('4° PC'));
      console.log(`   ✅ ${m.nombre} (${gradosFiltrados.join(', ')})`);
    });

    console.log('\n🎓 QUINTO PC:');
    console.log('   Grados: 5° PC');
    console.log('   Materias extracurriculares:');
    
    const pc5 = extracurriculares.filter(m => m.grados.includes('5° PC'));
    pc5.forEach(m => {
      const gradosFiltrados = m.grados.filter(g => g.includes('5° PC'));
      console.log(`   ✅ ${m.nombre} (${gradosFiltrados.join(', ')})`);
    });

    console.log('\n🎓 CUARTO Y QUINTO BCL:');
    console.log('   Grados: 4° BCL, 5° BCL');
    console.log('   Materias extracurriculares:');
    
    const bcl45 = extracurriculares.filter(m => 
      m.grados.includes('4° BCL') || 
      m.grados.includes('5° BCL')
    );
    
    bcl45.forEach(m => {
      const gradosFiltrados = m.grados.filter(g => 
        g.includes('4° BCL') || 
        g.includes('5° BCL')
      );
      console.log(`   ✅ ${m.nombre} (${gradosFiltrados.join(', ')})`);
    });

    console.log('\n🎓 SEXTO PC:');
    console.log('   Grados: 6° PC');
    console.log('   Materias extracurriculares:');
    
    const pc6 = extracurriculares.filter(m => m.grados.includes('6° PC'));
    pc6.forEach(m => {
      const gradosFiltrados = m.grados.filter(g => g.includes('6° PC'));
      console.log(`   ✅ ${m.nombre} (${gradosFiltrados.join(', ')})`);
    });

    // Estadísticas finales
    console.log('\n📈 ESTADÍSTICAS FINALES:');
    console.log(`✅ Total materias extracurriculares: ${extracurriculares.length}`);
    
    let totalAsignaciones = 0;
    extracurriculares.forEach(m => {
      totalAsignaciones += m.grados.length;
    });
    console.log(`✅ Total asignaciones grado-materia: ${totalAsignaciones}`);
    
    const activas = extracurriculares.filter(m => m.activa).length;
    console.log(`✅ Materias activas: ${activas}/${extracurriculares.length}`);

    console.log('\n🎯 VALIDACIÓN CONTRA REQUERIMIENTOS:');
    
    console.log('\n🔍 PRIMERO A TERCERO DE PRIMARIA:');
    const reqPrimaria123 = ['Comprensión de Lectura', 'Lógica Matemática'];
    reqPrimaria123.forEach(req => {
      const encontrada = primaria123.some(m => 
        m.nombre.toLowerCase().includes(req.toLowerCase()) || 
        req.toLowerCase().includes(m.nombre.toLowerCase())
      );
      console.log(`   ${encontrada ? '✅' : '❌'} ${req} - ${encontrada ? 'CONFIGURADA' : 'FALTANTE'}`);
    });

    console.log('\n🔍 CUARTO A SEXTO DE PRIMARIA:');
    const reqPrimaria456 = ['Comprensión de Lectura', 'Lógica Matemática'];
    reqPrimaria456.forEach(req => {
      const encontrada = primaria456.some(m => 
        m.nombre.toLowerCase().includes(req.toLowerCase()) || 
        req.toLowerCase().includes(m.nombre.toLowerCase())
      );
      console.log(`   ${encontrada ? '✅' : '❌'} ${req} - ${encontrada ? 'CONFIGURADA' : 'FALTANTE'}`);
    });

    console.log('\n🔍 PRIMERO A TERCERO BÁSICO:');
    const reqBasico123 = ['Moral Cristiana', 'Programa de Lectura'];
    reqBasico123.forEach(req => {
      const encontrada = basico123.some(m => 
        m.nombre.toLowerCase().includes(req.toLowerCase()) || 
        req.toLowerCase().includes(m.nombre.toLowerCase())
      );
      console.log(`   ${encontrada ? '✅' : '❌'} ${req} - ${encontrada ? 'CONFIGURADA' : 'FALTANTE'}`);
    });

    console.log('\n🔍 CUARTO PC:');
    const reqPC4 = ['Programa de Lectura', 'Moral Cristiana'];
    reqPC4.forEach(req => {
      const encontrada = pc4.some(m => 
        m.nombre.toLowerCase().includes(req.toLowerCase()) || 
        req.toLowerCase().includes(m.nombre.toLowerCase())
      );
      console.log(`   ${encontrada ? '✅' : '❌'} ${req} - ${encontrada ? 'CONFIGURADA' : 'FALTANTE'}`);
    });

    console.log('\n🔍 QUINTO PC:');
    const reqPC5 = ['Programa de Lectura', 'Moral Cristiana'];
    reqPC5.forEach(req => {
      const encontrada = pc5.some(m => 
        m.nombre.toLowerCase().includes(req.toLowerCase()) || 
        req.toLowerCase().includes(m.nombre.toLowerCase())
      );
      console.log(`   ${encontrada ? '✅' : '❌'} ${req} - ${encontrada ? 'CONFIGURADA' : 'FALTANTE'}`);
    });

    console.log('\n🔍 CUARTO Y QUINTO BCL:');
    const reqBCL45 = ['Razonamiento Verbal', 'Programa de Lectura', 'Moral Cristiana'];
    reqBCL45.forEach(req => {
      const encontrada = bcl45.some(m => 
        m.nombre.toLowerCase().includes(req.toLowerCase()) || 
        req.toLowerCase().includes(m.nombre.toLowerCase())
      );
      console.log(`   ${encontrada ? '✅' : '❌'} ${req} - ${encontrada ? 'CONFIGURADA' : 'FALTANTE'}`);
    });

    console.log('\n🔍 SEXTO PC:');
    const reqPC6 = ['Programa de Lectura', 'Moral Cristiana'];
    reqPC6.forEach(req => {
      const encontrada = pc6.some(m => 
        m.nombre.toLowerCase().includes(req.toLowerCase()) || 
        req.toLowerCase().includes(m.nombre.toLowerCase())
      );
      console.log(`   ${encontrada ? '✅' : '❌'} ${req} - ${encontrada ? 'CONFIGURADA' : 'FALTANTE'}`);
    });

    console.log('\n🎉 CLASIFICACIÓN DE MATERIAS EXTRACURRICULARES COMPLETADA');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resumenFinalClasificacion();
