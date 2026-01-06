import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verificarUsuarios() {
  try {
    console.log('👥 Verificando usuarios creados...');

    // Obtener todos los usuarios
    const usuarios = await prisma.user.findMany({
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        rol: true,
        activo: true,
        telefono: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    console.log(`\n📊 Total de usuarios: ${usuarios.length}`);
    
    if (usuarios.length === 0) {
      console.log('❌ No se encontraron usuarios en la base de datos');
      return;
    }

    // Agrupar por rol
    const usuariosPorRol = usuarios.reduce((acc, usuario) => {
      if (!acc[usuario.rol]) {
        acc[usuario.rol] = [];
      }
      acc[usuario.rol].push(usuario);
      return acc;
    }, {} as Record<string, any[]>);

    // Mostrar usuarios por rol
    Object.entries(usuariosPorRol).forEach(([rol, usuariosLista]) => {
      console.log(`\n🔹 ${rol} (${usuariosLista.length}):`);
      usuariosLista.forEach((usuario, index) => {
        console.log(`  ${index + 1}. ${usuario.nombre} ${usuario.apellido}`);
        console.log(`     📧 Email: ${usuario.email}`);
        console.log(`     📞 Teléfono: ${usuario.telefono || 'N/A'}`);
        console.log(`     ✅ Activo: ${usuario.activo ? 'Sí' : 'No'}`);
        console.log(`     🆔 ID: ${usuario.id}`);
        console.log(`     📅 Creado: ${usuario.createdAt.toLocaleDateString()}`);
        console.log('');
      });
    });

    // Verificar perfiles de docente
    console.log('\n👨‍🏫 Perfiles de docente:');
    const docentes = usuarios.filter(u => u.rol === 'DOCENTE');
    
    if (docentes.length > 0) {
      for (const docente of docentes) {
        const perfil = await prisma.teacherProfile.findUnique({
          where: { userId: docente.id },
          select: {
            userId: true,
            grados: true,
            status: true,
            createdAt: true
          }
        });

        console.log(`\n📋 Perfil de ${docente.nombre} ${docente.apellido}:`);
        if (perfil) {
          console.log(`  🎓 Grados: ${perfil.grados?.join(', ') || 'N/A'}`);
          console.log(`  📊 Status: ${perfil.status}`);
          console.log(`  📅 Creado: ${perfil.createdAt.toLocaleDateString()}`);
        } else {
          console.log(`  ❌ No tiene perfil de docente`);
        }
      }
    } else {
      console.log('  ❌ No hay docentes para mostrar perfiles');
    }

    // Verificar asignaciones de materias
    console.log('\n📚 Asignaciones de materias:');
    const asignaciones = await prisma.userMateria.findMany({
      include: {
        docente: {
          select: { nombre: true, email: true }
        },
        materia: {
          select: { nombre: true }
        },
        periodoAcademico: {
          select: { name: true }
        }
      },
      orderBy: {
        docente: { nombre: 'asc' }
      }
    });

    if (asignaciones.length > 0) {
      console.log(`\n📊 Total de asignaciones: ${asignaciones.length}`);
      
      // Agrupar por docente
      const asignacionesPorDocente = asignaciones.reduce((acc, asignacion) => {
        const docenteKey = `${asignacion.docente.nombre} (${asignacion.docente.email})`;
        if (!acc[docenteKey]) {
          acc[docenteKey] = [];
        }
        acc[docenteKey].push(asignacion);
        return acc;
      }, {} as Record<string, any[]>);

      Object.entries(asignacionesPorDocente).forEach(([docenteKey, asignacionesLista]) => {
        console.log(`\n👨‍🏫 ${docenteKey}:`);
        asignacionesLista.forEach((asignacion, index) => {
          console.log(`  ${index + 1}. ${asignacion.materia.nombre} - ${asignacion.periodoAcademico.name}`);
          console.log(`     📚 Sección: ${asignacion.seccion}, Horario: ${asignacion.horario}`);
          console.log(`     📊 Estado: ${asignacion.estado}`);
        });
      });
    } else {
      console.log('  ❌ No hay asignaciones de materias');
    }

  } catch (error) {
    console.error('❌ Error al verificar usuarios:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarUsuarios();
