import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaExtendedService } from '../prisma/prisma-extended.service';
import { EvaluacionHabito, CalificacionHabito, Prisma } from '@prisma/client';
import { GrupoHabito, HabitoEstudiante, ResumenHabitos } from './types/habitos.types';
import { PeriodoUnidadService } from '../academic-period/periodo-unidad.service';

@Injectable()
export class CalificacionHabitoService {
  constructor(
    private prisma: PrismaExtendedService,
    private periodoUnidadService: PeriodoUnidadService
  ) {}

  async actualizarCalificaciones(
    estudianteId: string,
    periodoId: string,
    calificaciones: Array<{
      evaluacionHabitoId: string;
      u1?: string | null;
      u2?: string | null;
      u3?: string | null;
      u4?: string | null;
      comentario?: string | null;
    }>,
    docenteId: string
  ) {
    console.log('\n=== INICIO actualizarCalificaciones ===');
    console.log('Datos recibidos:', {
      estudianteId,
      periodoId,
      docenteId,
      calificaciones: JSON.parse(JSON.stringify(calificaciones)) // Para evitar problemas de referencia circular
    });
    console.log('=== INICIO actualizarCalificaciones ===');
    console.log('Datos recibidos:', {
      estudianteId,
      periodoId,
      docenteId,
      calificaciones
    });
    // Verificar si el estudiante existe
    const estudiante = await this.prisma.student.findUnique({
      where: { id: estudianteId }
    });

    if (!estudiante) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    // Verificar si el período existe
    const periodo = await this.prisma.periodoAcademico.findUnique({
      where: { id: periodoId }
    });

    if (!periodo) {
      throw new NotFoundException('Período académico no encontrado');
    }

    // Verificar si el docente existe
    const docente = await this.prisma.user.findUnique({
      where: { id: docenteId }
    });

    if (!docente) {
      throw new NotFoundException('Docente no encontrado');
    }

    // Usar una transacción para asegurar la integridad de los datos
    return this.prisma.$transaction(async (prisma) => {
      const resultados: any[] = [];

      // Verificar si el estudiante existe
      const estudiante = await prisma.student.findUnique({
        where: { id: estudianteId }
      });

      if (!estudiante) {
        throw new NotFoundException('Estudiante no encontrado');
      }

      // Verificar si el período existe
      const periodo = await prisma.periodoAcademico.findUnique({
        where: { id: periodoId }
      });

      if (!periodo) {
        throw new NotFoundException('Período académico no encontrado');
      }

      // Verificar si el docente existe
      const docente = await prisma.user.findUnique({
        where: { id: docenteId }
      });

      if (!docente) {
        throw new NotFoundException('Docente no encontrado');
      }

      for (const calificacion of calificaciones) {
        console.log('\n--- Procesando evaluación ---');
        console.log('Datos de la evaluación recibida:', JSON.stringify(calificacion, null, 2));
        try {
          // Primero verificar si es una materia (cualquier tipo)
          console.log('\n🔍 Verificando si es una materia con ID:', calificacion.evaluacionHabitoId);
          const materia = await prisma.materia.findUnique({
            where: { 
              id: calificacion.evaluacionHabitoId
            },
            select: {
              id: true,
              nombre: true,
              descripcion: true,
              tipoMateria: {
                select: {
                  id: true,
                  nombre: true
                }
              },
              esExtracurricular: true
            }
          });

          let evaluacion;
          
          if (materia) {
            console.log('✅ Materia encontrada:', materia.nombre);
            
            // Determinar el tipo de evaluación según el tipoMateria
            let tipoEvaluacion: 'EXTRACURRICULAR' | 'CASA' | 'COMPORTAMIENTO' | 'APRENDIZAJE';
            if (materia.esExtracurricular) {
              tipoEvaluacion = 'EXTRACURRICULAR';
            } else if (materia.tipoMateria?.id === 'e133dce1-bb77-4b05-bdcb-0dc5d4c5df19') {
              tipoEvaluacion = 'CASA';
            } else if (materia.tipoMateria?.id === '16b47d65-2cb9-4c2e-8779-9e2f5576d896') {
              tipoEvaluacion = 'COMPORTAMIENTO';
            } else {
              tipoEvaluacion = 'APRENDIZAJE';
            }
            
            // Verificar si ya existe una evaluación para esta materia
            evaluacion = await prisma.evaluacionHabito.findFirst({
              where: {
                nombre: materia.nombre,
                tipo: tipoEvaluacion
              },
              select: {
                id: true,
                nombre: true,
                tipo: true,
                descripcion: true
              }
            });
            
            // Si no existe, crear la evaluación
            if (!evaluacion) {
              console.log('ℹ️ Creando evaluación para materia...');
              evaluacion = await prisma.evaluacionHabito.create({
                data: {
                  nombre: materia.nombre,
                  descripcion: materia.descripcion || `Evaluación de ${materia.nombre}`,
                  tipo: tipoEvaluacion,
                  activo: true,
                  orden: 999,
                  materia: {
                    connect: { id: materia.id }
                  }
                },
                select: {
                  id: true,
                  nombre: true,
                  tipo: true,
                  descripcion: true
                }
              });
              console.log('✅ Evaluación creada:', evaluacion);
            }
          } else {
            // Si no es una materia, buscar como evaluación normal
            console.log('\n🔍 Buscando evaluación con ID:', calificacion.evaluacionHabitoId);
            evaluacion = await prisma.evaluacionHabito.findUnique({
              where: { id: calificacion.evaluacionHabitoId },
              select: {
                id: true,
                nombre: true,
                tipo: true,
                descripcion: true
              }
            });
            
            if (!evaluacion) {
              console.error(`❌ No se encontró ni una materia extracurricular ni una evaluación con ID: ${calificacion.evaluacionHabitoId}`);
              continue;
            }
          }
          
          console.log('✅ Evaluación encontrada:', {
            id: evaluacion.id,
            nombre: evaluacion.nombre,
            tipo: evaluacion.tipo,
            esExtracurricular: evaluacion.tipo === 'EXTRACURRICULAR'
          });

          if (!evaluacion) {
            console.error(`Evaluación no encontrada: ${calificacion.evaluacionHabitoId}`);
            continue;
          }

          // Buscar si ya existe una calificación para esta evaluación, estudiante y período
          console.log('\n🔍 Buscando calificación existente para:');
          console.log('- Estudiante ID:', estudianteId);
          console.log('- Período ID:', periodoId);
          console.log('- Evaluación ID:', evaluacion.id); // Usar el ID de evaluación correcto
          console.log('- Docente ID:', docenteId);
          
          const calificacionExistente = await prisma.calificacionHabito.findFirst({
            where: {
              estudianteId,
              periodoId,
              evaluacionHabitoId: evaluacion.id, // Usar el ID de evaluación correcto
              docenteId
            },
            include: {
              evaluacionHabito: {
                select: {
                  id: true,
                  nombre: true,
                  tipo: true,
                  descripcion: true
                }
              }
            }
          });
          
          if (calificacionExistente) {
            console.log('✅ Calificación existente encontrada:', {
              id: calificacionExistente.id,
              evaluacion: calificacionExistente.evaluacionHabito.nombre,
              tipo: calificacionExistente.evaluacionHabito.tipo,
              valores: {
                u1: calificacionExistente.u1,
                u2: calificacionExistente.u2,
                u3: calificacionExistente.u3,
                u4: calificacionExistente.u4,
                comentario: calificacionExistente.comentario
              },
              timestamps: {
                createdAt: calificacionExistente.createdAt,
                updatedAt: calificacionExistente.updatedAt
              }
            });
          } else {
            console.log('ℹ️ No se encontró una calificación existente, se creará una nueva');
          }

          // Log detallado de los datos recibidos
          console.log('Procesando evaluación:', {
            evaluacionId: evaluacion.id,
            nombre: evaluacion.nombre,
            tipo: evaluacion.tipo,
            datosEnviados: {
              u1: calificacion.u1,
              u2: calificacion.u2,
              u3: calificacion.u3,
              u4: calificacion.u4,
              comentario: calificacion.comentario
            }
          });

          // Preparar los datos base para actualizar/crear
          const baseData: any = {
            u1: calificacion.u1 !== undefined ? calificacion.u1 : null,
            u2: calificacion.u2 !== undefined ? calificacion.u2 : null,
            u3: calificacion.u3 !== undefined ? calificacion.u3 : null,
            u4: calificacion.u4 !== undefined ? calificacion.u4 : null,
            comentario: calificacion.comentario || `Evaluación de ${evaluacion.nombre}`,
            evaluacionHabitoId: evaluacion.id,
            estudianteId,
            periodoId,
            docenteId,
            updatedAt: new Date()
          };

          // Datos para crear un nuevo registro
          const createData = {
            ...baseData,
            evaluacionHabito: {
              connect: { id: evaluacion.id }
            },
            estudiante: {
              connect: { id: estudianteId }
            },
            periodo: {
              connect: { id: periodoId }
            },
            docente: {
              connect: { id: docenteId }
            },
            createdAt: new Date()
          };
          
          // Eliminar los IDs ya que ahora usamos connect
          delete createData.evaluacionHabitoId;
          delete createData.estudianteId;
          delete createData.periodoId;
          delete createData.docenteId;
          
          console.log('\n📝 Datos para creación de calificación:', {
            evaluacion: evaluacion.nombre,
            tipo: evaluacion.tipo,
            valores: {
              u1: createData.u1,
              u2: createData.u2,
              u3: createData.u3,
              u4: createData.u4,
              comentario: createData.comentario
            },
            relaciones: {
              evaluacionHabitoId: evaluacion.id,
              estudianteId,
              periodoId,
              docenteId
            }
          });

          console.log('\n💾 Datos a guardar:', {
            evaluacion: evaluacion.nombre,
            tipo: evaluacion.tipo,
            esNueva: !calificacionExistente,
            valores: baseData
          });

          let resultado;

          if (calificacionExistente) {
            // Crear una copia de baseData sin los campos de relación
            const updateData = { ...baseData };
            delete updateData.evaluacionHabitoId;
            delete updateData.estudianteId;
            delete updateData.periodoId;
            delete updateData.docenteId;
            
            console.log('\n🔄 Actualizando calificación existente:', {
              id: calificacionExistente.id,
              cambios: updateData
            });
            
            // Actualizar calificación existente
            resultado = await prisma.calificacionHabito.update({
              where: { id: calificacionExistente.id },
              data: updateData,
              include: {
                evaluacionHabito: {
                  select: {
                    id: true,
                    nombre: true,
                    tipo: true,
                    descripcion: true
                  }
                }
              }
            });

            console.log('\n✅ Calificación actualizada exitosamente:', {
              id: resultado.id,
              evaluacion: evaluacion.nombre,
              tipo: evaluacion.tipo,
              esExtracurricular: evaluacion.tipo === 'EXTRACURRICULAR',
              valores: {
                u1: resultado.u1,
                u2: resultado.u2,
                u3: resultado.u3,
                u4: resultado.u4,
                comentario: resultado.comentario
              },
              timestamps: {
                createdAt: resultado.createdAt,
                updatedAt: resultado.updatedAt
              }
            });
          } else {
            console.log('\n➕ Creando nueva calificación');
            // Crear nueva calificación
            resultado = await prisma.calificacionHabito.create({
              data: createData,
              include: {
                evaluacionHabito: {
                  select: {
                    id: true,
                    nombre: true,
                    tipo: true,
                    descripcion: true
                  }
                }
              }
            });

            console.log('\n✅ Nueva calificación creada exitosamente:', {
              id: resultado.id,
              evaluacion: evaluacion.nombre,
              tipo: evaluacion.tipo,
              esExtracurricular: evaluacion.tipo === 'EXTRACURRICULAR',
              valores: {
                u1: resultado.u1,
                u2: resultado.u2,
                u3: resultado.u3,
                u4: resultado.u4,
                comentario: resultado.comentario
              },
              timestamps: {
                createdAt: resultado.createdAt,
                updatedAt: resultado.updatedAt
              }
            });
          }
          
          // Incluir detalles adicionales en la respuesta
          const resultadoEnriquecido = {
            ...resultado,
            nombre: evaluacion.nombre,
            tipo: evaluacion.tipo,
            esExtracurricular: evaluacion.tipo === 'EXTRACURRICULAR',
            evaluacionHabito: {
              ...(resultado.evaluacionHabito || {}),
              tipo: evaluacion.tipo
            }
          };
          
          resultados.push(resultadoEnriquecido);
          
        } catch (error) {
          console.error('\n❌ Error al procesar la calificación:', {
            error: error.message,
            stack: error.stack,
            evaluacion: {
              id: calificacion.evaluacionHabitoId,
              datos: calificacion
            },
            contexto: {
              estudianteId,
              periodoId,
              docenteId
            }
          });
          throw error;
        }
      }
      
      return resultados;
    });
  }

  async obtenerCalificacionesPorEstudiante(estudianteId: string, periodoId: string) {
    try {
      // Verificar si el estudiante existe
      const estudiante = await this.prisma.student.findUnique({
        where: { id: estudianteId }
      });

      if (!estudiante) {
        throw new NotFoundException('Estudiante no encontrado');
      }

      // Obtener las calificaciones existentes para este estudiante y período
      const calificacionesExistentes = await this.prisma.calificacionHabito.findMany({
        where: {
          estudianteId,
          periodoId
        },
        include: {
          docente: {
            select: {
              id: true,
              nombre: true,
              apellido: true
            }
          },
          evaluacionHabito: true
        },
        orderBy: [
          { createdAt: 'desc' } // Ordenar por fecha de creación para obtener la más reciente primero
        ]
      });

      // Agrupar calificaciones por evaluación
      const calificacionesPorEvaluacion = new Map<string, any[]>();
      
      // Crear mapa de traducción de materiaId a evaluacionId
      const materiaIdAEvaluacionId = new Map<string, string>();
      
      for (const calificacion of calificacionesExistentes) {
        if (!calificacionesPorEvaluacion.has(calificacion.evaluacionHabitoId)) {
          calificacionesPorEvaluacion.set(calificacion.evaluacionHabitoId, []);
        }
        calificacionesPorEvaluacion.get(calificacion.evaluacionHabitoId)?.push(calificacion);
        
        // Si la calificación está asociada a una evaluación que tiene materiaId,
        // crear el mapeo para que el frontend pueda encontrarla usando el ID de materia
        if (calificacion.evaluacionHabito?.materiaId) {
          materiaIdAEvaluacionId.set(calificacion.evaluacionHabito.materiaId, calificacion.evaluacionHabitoId);
        }
      }

      // Obtener todas las evaluaciones de hábitos activas, excluyendo las extracurriculares
      const evaluacionesRegulares = await this.prisma.evaluacionHabito.findMany({
        where: { 
          activo: true,
          tipo: { not: 'EXTRACURRICULAR' } // Excluir evaluaciones extracurriculares
        },
        orderBy: [
          { tipo: 'asc' },
          { orden: 'asc' }
        ]
      });

      // Obtener información del estudiante para filtrar por grado
      const infoEstudiante = await this.prisma.student.findUnique({
        where: { id: estudianteId },
        select: { grados: true }
      });

      if (!infoEstudiante) {
        throw new NotFoundException('Estudiante no encontrado');
      }

      console.log(`\n🔍 DEPURACIÓN - Grado del estudiante: ${infoEstudiante.grados.join(', ')}`);

      // Construir las condiciones LIKE para cada grado (usando solo el grado base)
      const gradosConditions = infoEstudiante.grados.map(grado => {
        // Extraer solo el grado base (ej: "1° Primaria A" -> "1° Primaria")
        const gradoBase = grado.split(' ')[0] + ' ' + grado.split(' ')[1];
        return `m.grados::text LIKE '%${gradoBase}%'`;
      }).join(' OR ');
      
      // Construir la consulta SQL completa
      const sqlQuery = `
        SELECT 
          m.id,
          m.nombre,
          m.descripcion,
          m.codigo,
          m.creditos,
          m.activa,
          m."esExtracurricular",
          m.orden,
          m."createdAt",
          m."updatedAt",
          m."tipoMateriaId",
          m.grados,
          tm.nombre as "tipoMateriaNombre",
          tm.descripcion as "tipoMateriaDescripcion"
        FROM "Materia" m
        LEFT JOIN "TipoMateria" tm ON m."tipoMateriaId" = tm.id
        WHERE m."activa" = true
        AND (
          m."esExtracurricular" = true 
          OR m."tipoMateriaId" = 'e133dce1-bb77-4b05-bdcb-0dc5d4c5df19' 
          OR m."tipoMateriaId" = '16b47d65-2cb9-4c2e-8779-9e2f5576d896'
        )
        AND (${gradosConditions})
        ORDER BY m."orden" ASC, m."nombre" ASC
      `;

      // Obtener materias de hábitos que aplican a los grados del estudiante usando raw SQL
      const materiasHabitosRaw = await this.prisma.$queryRawUnsafe<any>(sqlQuery);

      // Convertir los resultados raw al formato esperado
      const materiasHabitos = materiasHabitosRaw.map((m: any) => ({
        id: m.id,
        nombre: m.nombre,
        descripcion: m.descripcion,
        codigo: m.codigo,
        creditos: m.creditos,
        activa: m.activa,
        esExtracurricular: m.esExtracurricular,
        orden: m.orden,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
        tipoMateriaId: m.tipoMateriaId,
        grados: m.grados || [],
        tipoMateria: m.tipoMateriaId ? {
          id: m.tipoMateriaId,
          nombre: m.tipoMateriaNombre,
          descripcion: m.tipoMateriaDescripcion
        } : null
      }));

      console.log(`📚 Materias encontradas (${materiasHabitos.length}):`);
      materiasHabitos.forEach(m => {
        console.log(`  - ${m.nombre} (tipoMateriaId: ${m.tipoMateriaId}, esExtracurricular: ${m.esExtracurricular}, grados: [${m.grados?.join(', ')}])`);
      });

      // Obtener evaluaciones de hábitos extracurriculares existentes
      const evaluacionesExtracurriculares = await this.prisma.evaluacionHabito.findMany({
        where: {
          tipo: 'EXTRACURRICULAR',
          activo: true
        },
        orderBy: [
          { nombre: 'asc' }
        ]
      });

      // Mapa para evitar duplicados
      const evaluacionesProcesadas = new Set<string>();
      const resultado: HabitoEstudiante[] = [];
      
      // 1. Procesar materias de hábitos primero (prioridad sobre evaluaciones regulares)
      for (const materia of materiasHabitos) {
        // Buscar si ya existe una evaluación para esta materia
        const evaluacionExistente = evaluacionesExtracurriculares.find(
          e => e.nombre.toLowerCase() === materia.nombre.toLowerCase()
        );
        
        // Usar el mapa de traducción para encontrar las calificaciones correctas
        // Si es una materia, buscar calificaciones usando el ID de evaluación asociado
        let evaluacionIdParaCalificaciones: string;
        if (evaluacionExistente) {
          evaluacionIdParaCalificaciones = evaluacionExistente.id;
        } else {
          // Buscar en el mapa de traducción de materia a evaluación
          evaluacionIdParaCalificaciones = materiaIdAEvaluacionId.get(materia.id) || materia.id;
        }
        
        const calificacionesMateria = calificacionesPorEvaluacion.get(evaluacionIdParaCalificaciones) || [];
          
        const ultimaCalificacion = calificacionesMateria[0];
        
        // Determinar el tipo de evaluación según el tipoMateria y si es extracurricular
        let tipoEvaluacion: string;
        
        if (materia.esExtracurricular) {
          // Materias extracurriculares tradicionales
          tipoEvaluacion = 'EXTRACURRICULAR';
        } else if (materia.tipoMateriaId === 'e133dce1-bb77-4b05-bdcb-0dc5d4c5df19') {
          // HOGAR -> Hábitos en casa
          tipoEvaluacion = 'CASA';
        } else if (materia.tipoMateriaId === '16b47d65-2cb9-4c2e-8779-9e2f5576d896') {
          // HABITO -> Puede ser COMPORTAMIENTO o APRENDIZAJE según el nombre
          const comportamientos = [
            'Respeta autoridad', 'Interactúa bien con sus compañeros', 'Respeta los derechos y propiedades de otros',
            'Demuestra control de sí mismo', 'Acepta responsabilidad de sus acciones', 'RESPETA AUTORIDAD',
            'INTERACTÚA BIEN CON SUS COMPAÑEROS', 'ACEPTA RESPONSABILIDAD DE SUS ACCIONES',
            'PRÁCTICA VALORES MORALES DIARIAMENTE', 'RESPONSABLE EN CLASES', 'COMPLETA TRABAJOS A TIEMPO',
            'PARTICIPA EN ACTIVIDADES DE APRENDIZAJE', 'LLEGA A TIEMPO', 'ATIENDE JUNTAS DE PADRES',
            'PRÁCTICA DIARIMAENTE LO ESTUDIADO', 'RESPONSABLE EN CLASE', 'Completa Trabajos a Tiempo',
            'Participa en actividades de aprendizaje', 'Respeta Autoridad', 'Práctica valores morales diariamente',
            'Acepta responsabilidad de sus acciones', 'Interactúa bien con sus compañeros',
            'Llega a tiempo', 'Respeta los derechos y propiedades de otros', 'LLEGA A TIEMPO',
            'Atiende juntas de padres', 'Práctica diariamente lo estudiado'
          ];
          
          if (comportamientos.includes(materia.nombre)) {
            tipoEvaluacion = 'COMPORTAMIENTO';
          } else {
            // Los demás son de aprendizaje
            tipoEvaluacion = 'APRENDIZAJE';
          }
        } else {
          // Default
          tipoEvaluacion = 'EXTRACURRICULAR';
        }

        const habito: HabitoEstudiante = {
          id: ultimaCalificacion?.id,
          evaluacionHabitoId: evaluacionIdParaCalificaciones, // Usar el ID de evaluación correcto
          nombre: materia.nombre,
          descripcion: materia.descripcion || `Evaluación de ${materia.nombre}`,
          tipo: tipoEvaluacion,
          tipoMateriaId: materia.tipoMateria?.id, // Incluir el tipoMateriaId correcto
          grados: materia.grados || [], // Incluir los grados de la materia
          u1: ultimaCalificacion?.u1 || null,
          u2: ultimaCalificacion?.u2 || null,
          u3: ultimaCalificacion?.u3 || null,
          u4: ultimaCalificacion?.u4 || null,
          comentario: ultimaCalificacion?.comentario || null,
          createdAt: ultimaCalificacion?.createdAt || null,
          updatedAt: ultimaCalificacion?.updatedAt || null,
          calificaciones: calificacionesMateria,
          esMateria: true
        };
        
        resultado.push(habito);
        evaluacionesProcesadas.add(materia.nombre.toLowerCase());
      }
      
      // 2. Procesar evaluaciones regulares (solo si no fueron procesadas como materia)
      for (const evaluacion of evaluacionesRegulares) {
        // Solo agregar si no se ha procesado ya una evaluación con este nombre
        if (!evaluacionesProcesadas.has(evaluacion.nombre.toLowerCase())) {
          const calificaciones = calificacionesPorEvaluacion.get(evaluacion.id) || [];
          const ultimaCalificacion = calificaciones[0];
          
          const habito: HabitoEstudiante = {
            id: ultimaCalificacion?.id,
            evaluacionHabitoId: evaluacion.id,
            nombre: evaluacion.nombre,
            descripcion: evaluacion.descripcion || '',
            tipo: evaluacion.tipo,
            u1: ultimaCalificacion?.u1 || null,
            u2: ultimaCalificacion?.u2 || null,
            u3: ultimaCalificacion?.u3 || null,
            u4: ultimaCalificacion?.u4 || null,
            comentario: ultimaCalificacion?.comentario || null,
            createdAt: ultimaCalificacion?.createdAt || null,
            updatedAt: ultimaCalificacion?.updatedAt || null,
            calificaciones: calificaciones,
            esMateria: false
          };
          
          resultado.push(habito);
          evaluacionesProcesadas.add(evaluacion.nombre.toLowerCase());
        }
      }
      
      // Ordenar el resultado: primero las evaluaciones regulares, luego las extracurriculares
      return resultado.sort((a, b) => {
        // Ordenar por tipo (primero las que no son EXTRACURRICULAR)
        if (a.tipo !== 'EXTRACURRICULAR' && b.tipo === 'EXTRACURRICULAR') return -1;
        if (a.tipo === 'EXTRACURRICULAR' && b.tipo !== 'EXTRACURRICULAR') return 1;
        
        // Si son del mismo tipo, ordenar por nombre
        return a.nombre.localeCompare(b.nombre);
      });
      
    } catch (error) {
      console.error('Error en obtenerCalificacionesPorEstudiante:', error);
      throw new Error('Error al obtener las calificaciones de hábitos');
    }
  }

  async actualizarCalificacionHabito(
    id: string, 
    data: { 
      u1?: string; 
      u2?: string; 
      u3?: string; 
      u4?: string; 
      comentario?: string;
      esExtraescolar?: boolean;
    },
    docenteId: string
  ) {
    // Verificar si la calificación existe
    const [calificacionExistente] = await this.prisma.$queryRaw<CalificacionHabito[]>`
      SELECT * FROM "CalificacionHabito" WHERE "id" = ${id}::uuid
    `;

    if (!calificacionExistente) {
      throw new NotFoundException('Calificación no encontrada');
    }

    // Construir la consulta de actualización dinámica
    const updateFields: string[] = [];
    const values: (string | Date | null | boolean)[] = [id];
    let paramIndex = 2; // Empezamos desde 2 porque $1 es el ID

    // Si se está actualizando el campo esExtraescolar
    if (data.esExtraescolar !== undefined) {
      // Verificamos si la materia existe y es extracurricular
      const [materia] = await this.prisma.$queryRaw<any[]>`
        SELECT id FROM "Materia" 
        WHERE "id" = (SELECT "evaluacionHabitoId" FROM "CalificacionHabito" WHERE "id" = ${id}::uuid)
        AND "esExtraescolar" = true
      `;
      
      if (materia) {
        updateFields.push(`"esExtraescolar" = $${paramIndex}`);
        values.push(data.esExtraescolar);
        paramIndex++;
      }
    }

    if (data.u1 !== undefined) {
      updateFields.push(`"u1" = $${paramIndex}`);
      values.push(data.u1 || null);
      paramIndex++;
    }
    if (data.u2 !== undefined) {
      updateFields.push(`"u2" = $${paramIndex}`);
      values.push(data.u2 || null);
      paramIndex++;
    }
    if (data.u3 !== undefined) {
      updateFields.push(`"u3" = $${paramIndex}`);
      values.push(data.u3 || null);
      paramIndex++;
    }
    if (data.u4 !== undefined) {
      updateFields.push(`"u4" = $${paramIndex}`);
      values.push(data.u4 || null);
      paramIndex++;
    }
    if (data.comentario !== undefined) {
      updateFields.push(`"comentario" = $${paramIndex}`);
      values.push(data.comentario || null);
      paramIndex++;
    }

    // Agregar campos fijos
    updateFields.push(`"docenteId" = $${paramIndex}::uuid`);
    values.push(docenteId);
    paramIndex++;
    
    updateFields.push(`"updatedAt" = $${paramIndex}::timestamp`);
    values.push(new Date().toISOString());
    paramIndex++;

    const query = `
      UPDATE "CalificacionHabito"
      SET ${updateFields.join(', ')}
      WHERE "id" = $1::uuid
      RETURNING *,
        (SELECT row_to_json(eh) FROM "EvaluacionHabito" eh WHERE eh."id" = "evaluacionHabitoId") as "evaluacionHabito",
        (SELECT json_build_object('id', u."id", 'nombre', u."nombre", 'apellido', u."apellido")
         FROM "User" u WHERE u."id" = "docenteId") as "docente"
    `;

    const [updated] = await this.prisma.$queryRawUnsafe(query, ...values) as any[];
    return updated;
  }

  async crearCalificacionHabito(
    estudianteId: string,
    evaluacionHabitoId: string,
    periodoId: string,
    docenteId: string,
    data: {
      u1?: string;
      u2?: string;
      u3?: string;
      u4?: string;
      comentario?: string;
      esExtraescolar?: boolean;
    }
  ) {
    // Verificar si ya existe una calificación para este estudiante, evaluación y período
    const [existing] = await this.prisma.$queryRaw<CalificacionHabito[]>`
      SELECT * FROM "CalificacionHabito"
      WHERE "estudianteId" = ${estudianteId}::uuid
      AND "evaluacionHabitoId" = ${evaluacionHabitoId}::uuid
      AND "periodoId" = ${periodoId}::uuid
    `;

    if (existing) {
      return this.actualizarCalificacionHabito(existing.id, data, docenteId);
    }

    // Si es una materia extracurricular, buscamos su información
    let esMateriaExtra = false;
    if (data.esExtraescolar) {
      const [materia] = await this.prisma.$queryRaw<any[]>`
        SELECT id FROM "Materia" 
        WHERE "id" = ${evaluacionHabitoId}::uuid 
        AND "esExtraescolar" = true
      `;
      esMateriaExtra = !!materia;
    }

    // Crear nueva calificación
    const result = await this.prisma.$queryRaw`
      INSERT INTO "CalificacionHabito" (
        "id", "estudianteId", "evaluacionHabitoId", "periodoId", "docenteId",
        "u1", "u2", "u3", "u4", "comentario", "createdAt", "updatedAt",
        "esExtraescolar"
      ) VALUES (
        gen_random_uuid(), ${estudianteId}::uuid, ${evaluacionHabitoId}::uuid, 
        ${periodoId}::uuid, ${docenteId}::uuid,
        ${data.u1 || null}, ${data.u2 || null}, 
        ${data.u3 || null}, ${data.u4 || null}, 
        ${data.comentario || null}, NOW(), NOW(),
        ${esMateriaExtra}
      )
      RETURNING *,
        (SELECT row_to_json(eh) FROM "EvaluacionHabito" eh WHERE eh."id" = "evaluacionHabitoId") as "evaluacionHabito",
        (SELECT json_build_object('id', u."id", 'nombre', u."nombre", 'apellido', u."apellido")
         FROM "User" u WHERE u."id" = "docenteId") as "docente"
    ` as any[];

    return result[0];
  }

  async verificarPermisoDocente(docenteId: string, estudianteId: string): Promise<boolean> {
    // Implementar lógica para verificar si el docente tiene permiso para ver/editar este estudiante
    // Por ahora, devolvemos true para simplificar
    return true;
  }

  async obtenerResumenHabitos(estudianteId: string, periodoId: string): Promise<ResumenHabitos> {
    interface CalificacionWithEvaluacion extends CalificacionHabito {
      evaluacionHabito_nombre: string;
      evaluacionHabito_tipo: string;
    }

    const calificaciones = await this.prisma.$queryRaw<CalificacionWithEvaluacion[]>`
      SELECT ch.*, 
             eh."nombre" as "evaluacionHabito_nombre",
             eh."tipo" as "evaluacionHabito_tipo"
      FROM "CalificacionHabito" ch
      JOIN "EvaluacionHabito" eh ON ch."evaluacionHabitoId" = eh."id"
      WHERE ch."estudianteId" = ${estudianteId}::uuid
        AND ch."periodoId" = ${periodoId}::uuid
        AND eh."activo" = true
    `;

    // Inicializar el resumen con arrays vacíos
    const resumen: ResumenHabitos = {
      habito_casa: [],
      responsabilidad_aprendizaje: [],
      comportamiento: []
    };

    // Procesar cada calificación
    for (const cal of calificaciones) {
      const tipo = cal.evaluacionHabito_tipo as keyof ResumenHabitos;
      
      if (resumen[tipo]) {
        const habito: GrupoHabito = {
          id: cal.id,
          nombre: cal.evaluacionHabito_nombre,
          u1: cal.u1,
          u2: cal.u2,
          u3: cal.u3,
          u4: cal.u4,
          comentario: cal.comentario
        };
        
        resumen[tipo].push(habito);
      }
    }

    return resumen;
  }

  // Nuevo método para obtener calificaciones con unidad dinámica
  async obtenerCalificacionesConUnidadDinamica(
    estudianteId: string,
    periodoId: string
  ): Promise<{
    resumen: ResumenHabitos;
    unidadActual: string;
    nombreUnidad: string;
  }> {
    // Obtener la unidad asignada para este período
    const unidadActual = await this.periodoUnidadService.getUnidadPorPeriodo(periodoId);
    
    // Obtener información del período para mostrar nombre
    const periodo = await this.prisma.periodoAcademico.findUnique({
      where: { id: periodoId },
      select: { name: true }
    });

    // Mapear unidad a nombre descriptivo
    const nombreUnidad = this.getNombreUnidad(unidadActual);

    // Obtener las calificaciones existentes
    const resumen = await this.obtenerResumenHabitos(estudianteId, periodoId);

    return {
      resumen,
      unidadActual,
      nombreUnidad: `${nombreUnidad} - ${periodo?.name || 'Período'}`
    };
  }

  private getNombreUnidad(unidad: string): string {
    const nombres = {
      'u1': 'Primera Unidad',
      'u2': 'Segunda Unidad', 
      'u3': 'Tercera Unidad',
      'u4': 'Cuarta Unidad'
    };
    return nombres[unidad as keyof typeof nombres] || unidad;
  }

  // Método para actualizar calificaciones usando unidad dinámica
  async actualizarCalificacionPorUnidad(
    estudianteId: string,
    periodoId: string,
    evaluacionHabitoId: string,
    valor: string,
    comentario?: string
  ) {
    // Obtener la unidad correspondiente al período
    const unidad = await this.periodoUnidadService.getUnidadPorPeriodo(periodoId);
    
    // Construir el objeto de actualización dinámicamente
    const updateData: any = {
      comentario: comentario || null
    };
    
    // Asignar el valor a la unidad correspondiente
    updateData[unidad] = valor;

    // Buscar si ya existe una calificación para esta combinación
    const calificacionExistente = await this.prisma.calificacionHabito.findFirst({
      where: {
        estudianteId,
        periodoId,
        evaluacionHabitoId
      }
    });

    if (calificacionExistente) {
      // Actualizar existente
      return this.prisma.calificacionHabito.update({
        where: { id: calificacionExistente.id },
        data: updateData
      });
    } else {
      // Crear nueva
      return this.prisma.calificacionHabito.create({
        data: {
          estudianteId,
          periodoId,
          evaluacionHabitoId,
          docenteId: '', // Debe venir del contexto del usuario autenticado
          ...updateData
        }
      });
    }
  }
}
