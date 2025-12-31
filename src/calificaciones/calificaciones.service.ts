import { 
  Injectable, 
  NotFoundException, 
  ConflictException, 
  BadRequestException, 
  UnauthorizedException, 
  Logger, 
  Inject, 
  forwardRef 
} from '@nestjs/common';
import { TipoCalificacion } from './dto/create-calificacion.dto';
import { PrismaClient, UserRole } from '@prisma/client';
import { CreateCalificacionDto } from './dto/create-calificacion.dto';
import { UpdateCalificacionDto } from './dto/update-calificacion.dto';
import { MateriasService } from '../materias/materias.service';
import { AcademicPeriodService } from '../academic-period/academic-period.service';

// Define the type based on the Prisma model
type CalificacionWithRelations = {
  id: string;
  estudianteId: string;
  materiaId: string;
  periodoId: string;
  docenteId: string;
  calificacion: number | null;
  valorConceptual: string | null;
  tipoCalificacion: string;
  tipoEvaluacion: string;
  comentario: string | null;
  fecha: Date;
  estudiante: { id: string; nombre: string; apellido: string };
  materia: { id: string; nombre: string };
  periodo: { id: string; name: string };
  docente: { id: string; nombre: string; apellido: string | null };
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class CalificacionesService {
  private prisma: PrismaClient;
  private readonly logger = new Logger(CalificacionesService.name);

  constructor(
    @Inject(forwardRef(() => MateriasService))
    private materiasService: MateriasService,
    private academicPeriodService: AcademicPeriodService
  ) {
    this.prisma = new PrismaClient();
  }

  async crearCalificacion(
    docenteId: string, 
    createCalificacionDto: CreateCalificacionDto
  ): Promise<CalificacionWithRelations> {
    console.log('=== Iniciando creación de calificación ===');
    console.log('Datos recibidos:', JSON.stringify(createCalificacionDto, null, 2));
    
    // Verify the teacher exists and is a DOCENTE
    const docente = await this.prisma.user.findUnique({
      where: { 
        id: docenteId,
        rol: 'DOCENTE' 
      }
    });

    if (!docente) {
      throw new UnauthorizedException('Solo los docentes pueden crear calificaciones');
    }

    // Validate the DTO
    try {
      createCalificacionDto.validate();
    } catch (error) {
      console.error('Error de validación del DTO:', error.message);
      throw new BadRequestException(error.message);
    }
    
    // Extract and validate required fields
    const { 
      estudianteId, 
      materiaId, 
      userMateriaId,
      nombreMateria, 
      esExtraescolar = false, // Default a false si no se especifica
      periodoId, 
      ...rest 
    } = createCalificacionDto;
    
    console.log('Datos recibidos en el servicio:', {
      estudianteId,
      materiaId,
      userMateriaId,
      nombreMateria,
      esExtraescolar,
      periodoId,
      ...rest
    });
    
    // Validación básica
    if (!estudianteId || !periodoId) {
      throw new BadRequestException('Se requieren el ID del estudiante y del período');
    }
    
    // Si es extracurricular, no necesitamos userMateriaId
    let materiaIdToUse = materiaId;
    if (!esExtraescolar) {
      // Solo verificar userMateria si no es extracurricular
      if (userMateriaId) {
        console.log('Buscando materia a partir de userMateriaId:', userMateriaId);
        const userMateria = await this.prisma.userMateria.findUnique({
          where: { id: userMateriaId },
          select: { materiaId: true }
        });
        
        if (!userMateria) {
          throw new BadRequestException('No se encontró la relación usuario-materia especificada');
        }
        
        materiaIdToUse = userMateria.materiaId;
        console.log('Materia encontrada a partir de userMateriaId:', materiaIdToUse);
      } else if (!materiaId) {
        // Si no es extracurricular y no hay materiaId, es un error
        throw new BadRequestException('Se requiere un ID de materia o un ID de relación usuario-materia para materias regulares');
      }
    }

    // Verificar si el estudiante existe
    const estudiante = await this.prisma.student.findUnique({
      where: { id: estudianteId },
    });
    if (!estudiante) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    // Verificar si el período existe
    const periodo = await this.academicPeriodService.findOne(periodoId);
    if (!periodo) {
      throw new NotFoundException('Período académico no encontrado');
    }

    // Si llegamos aquí y no tenemos un ID de materia, verificar si es necesario
    // (esta validación ya se maneja en el bloque anterior)
    
    if (esExtraescolar) {
      // Si es extracurricular, verificar que tenemos el nombre de la materia
      if (!nombreMateria) {
        throw new BadRequestException('Se requiere el nombre de la materia para materias extracurriculares');
      }
      try {
        console.log('=== Buscando o creando materia extracurricular ===');
        console.log('Datos recibidos:', { materiaId, nombreMateria, esExtraescolar });
        
        // Primero, obtener el tipo de materia extracurricular
        const tipoExtracurricular = await this.materiasService.findOrCreateTipoExtracurricular();
        console.log('Tipo extracurricular:', tipoExtracurricular);
        
        if (!tipoExtracurricular || !tipoExtracurricular.id) {
          throw new Error('No se pudo obtener el tipo de materia extracurricular');
        }
        
        // Buscar si ya existe una materia con ese nombre (sin importar el tipo)
        const materiaExistente = await this.prisma.materia.findFirst({
          where: {
            nombre: nombreMateria,
            OR: [
              { tipoMateriaId: tipoExtracurricular.id },
              { tipoMateriaId: null }
            ]
          },
          include: { tipoMateria: true }
        });
        
        console.log('Resultado de búsqueda de materia existente:', 
          materiaExistente ? 
          `ID: ${materiaExistente.id}, Nombre: ${materiaExistente.nombre}, Tipo: ${materiaExistente.tipoMateria?.nombre || 'Sin tipo'}` : 
          'No se encontró materia existente');

        if (materiaExistente) {
          // Si existe, usar la materia existente
          materiaIdToUse = materiaExistente.id;
          console.log('Usando materia existente:', {
            id: materiaExistente.id,
            nombre: materiaExistente.nombre,
            tipoMateria: materiaExistente.tipoMateria?.nombre || 'Sin tipo',
            activa: materiaExistente.activa
          });
          
          // Si la materia existe pero no tiene tipo o no es extracurricular, actualizarla
          if (!materiaExistente.tipoMateriaId || materiaExistente.tipoMateriaId !== tipoExtracurricular.id || !materiaExistente.esExtracurricular) {
            console.log('Actualizando tipo de materia a extracurricular...');
            await this.prisma.materia.update({
              where: { id: materiaExistente.id },
              data: { 
                tipoMateriaId: tipoExtracurricular.id,
                activa: true,
                esExtracurricular: true
              }
            });
          }
        } else {
          console.log('No se encontró la materia, creando nueva...');
          
          // Crear la materia extracurricular
          const codigoUnico = `EXT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          
          console.log('Creando nueva materia con código:', codigoUnico);
          
          const nuevaMateria = await this.prisma.materia.create({
            data: {
              nombre: nombreMateria?.trim() || '',
              codigo: codigoUnico,
              creditos: 0,
              descripcion: `Materia extracurricular: ${nombreMateria || ''}`,
              tipoMateriaId: tipoExtracurricular.id,
              activa: true,
              esExtracurricular: true
            },
            select: { id: true, nombre: true, codigo: true }
          });

          if (!nuevaMateria || !nuevaMateria.id) {
            console.error('Error al crear la materia:', nuevaMateria);
            throw new Error('No se pudo crear la materia extracurricular');
          }
          
          materiaIdToUse = nuevaMateria.id;
          console.log('Nueva materia creada con éxito:', nuevaMateria);
          
          // Verificar que la materia se creó correctamente
          const materiaCreada = await this.prisma.materia.findUnique({
            where: { id: nuevaMateria.id },
            include: { tipoMateria: true }
          });
          
          console.log('Verificación de creación de materia:', 
            materiaCreada ? 
            `ID: ${materiaCreada.id}, Nombre: ${materiaCreada.nombre}, Tipo: ${materiaCreada.tipoMateria?.nombre || 'Sin tipo'}` : 
            'No se pudo verificar la creación');
        }
        
        // Verificar que la materia existe y es accesible
        if (materiaIdToUse) {
          try {
            console.log('Verificando materia con ID:', materiaIdToUse);
            const materiaVerificada = await this.prisma.materia.findUnique({
              where: { id: materiaIdToUse },
              include: { tipoMateria: true }
            });
            
            if (!materiaVerificada) {
              console.error('Error: La materia no se pudo verificar después de crearla');
              throw new Error('No se pudo verificar la creación de la materia');
            }
            
            console.log('Materia verificada exitosamente:', {
              id: materiaVerificada.id,
              nombre: materiaVerificada.nombre,
              tipoMateria: materiaVerificada.tipoMateria
            });
            
            // Verificar que la materia esté activa
            if (!materiaVerificada.activa) {
              console.log('Activando materia inactiva...');
              await this.prisma.materia.update({
                where: { id: materiaVerificada.id },
                data: { activa: true }
              });
            }
          } catch (error) {
            console.error('Error al verificar la materia:', error);
            throw new Error('Error al verificar la materia: ' + error.message);
          }
        }
      } catch (error) {
        console.error('Error al crear la materia extracurricular:', error);
        throw new BadRequestException('Error al crear la materia extracurricular');
      }
    }
    
    // Si es extracurricular y no tenemos un ID de materia, buscar o crear la materia
    if (esExtraescolar && !materiaId) {
      try {
        console.log('=== Buscando o creando materia extracurricular ===');
        const tipoExtracurricular = await this.materiasService.findOrCreateTipoExtracurricular();
        
        if (!tipoExtracurricular?.id) {
          throw new Error('No se pudo obtener el tipo de materia extracurricular');
        }
        
        // Buscar si ya existe una materia con ese nombre
        const materiaExistente = await this.prisma.materia.findFirst({
          where: {
            nombre: nombreMateria,
            tipoMateriaId: tipoExtracurricular.id
          }
        });
        
        if (materiaExistente) {
          materiaIdToUse = materiaExistente.id;
          console.log('Usando materia existente:', materiaExistente);
        } else {
          // Crear nueva materia extracurricular
          const codigoUnico = `EXT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          const nuevaMateria = await this.prisma.materia.create({
            data: {
              nombre: nombreMateria?.trim() || '',
              codigo: codigoUnico,
              creditos: 0,
              descripcion: `Materia extracurricular: ${nombreMateria || ''}`,
              tipoMateriaId: tipoExtracurricular.id,
              activa: true
            }
          });
          materiaIdToUse = nuevaMateria.id;
          console.log('Nueva materia creada:', nuevaMateria);
        }
      } catch (error) {
        console.error('Error al manejar materia extracurricular:', error);
        throw new BadRequestException('Error al procesar la materia extracurricular');
      }
    }
    
    // Verificar que tenemos un ID de materia válido
    if (!materiaIdToUse) {
      throw new BadRequestException('No se pudo determinar la materia para la calificación');
    }
    
    // Verificar que la materia existe y está activa
    try {
      console.log('Verificando materia con ID:', materiaIdToUse);
      const materia = await this.prisma.materia.findUnique({
        where: { id: materiaIdToUse },
        include: { tipoMateria: true }
      });
      
      if (!materia) {
        throw new NotFoundException(`No se encontró la materia con ID: ${materiaIdToUse}`);
      }
      
      console.log('Materia verificada:', {
        id: materia.id,
        nombre: materia.nombre,
        tipoMateria: materia.tipoMateria?.nombre || 'Sin tipo',
        activa: materia.activa
      });
      
      // Si es extracurricular, asegurarse de que esté activa
      if (esExtraescolar && !materia.activa) {
        console.log('Activando materia extracurricular inactiva...');
        await this.prisma.materia.update({
          where: { id: materia.id },
          data: { activa: true }
        });
      }
    } catch (error) {
      console.error('Error al verificar la materia:', error);
      throw new BadRequestException('Error al verificar la materia: ' + error.message);
    }

    // Verificar si ya existe una calificación para este estudiante, materia y período
    const existingCalificacion = await this.prisma.calificacion.findFirst({
      where: {
        estudianteId,
        materiaId: materiaIdToUse,
        periodoId,
        tipoEvaluacion: rest.tipoEvaluacion,
      },
    });

    if (existingCalificacion) {
      throw new ConflictException('Ya existe una calificación para este estudiante, materia y período');
    }

    // Crear la calificación
    return this.prisma.calificacion.create({
      data: {
        estudiante: { connect: { id: estudianteId } },
        materia: { connect: { id: materiaIdToUse } },
        periodo: { connect: { id: periodoId } },
        docente: { connect: { id: docenteId } },
        tipoCalificacion: rest.tipoCalificacion,
        tipoEvaluacion: rest.tipoEvaluacion,
        calificacion: rest.calificacion,
        valorConceptual: rest.valorConceptual,
        comentario: rest.comentario,
        fecha: new Date(),
      },
      include: {
        estudiante: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
        materia: {
          select: {
            id: true,
            nombre: true,
          },
        },
        periodo: {
          select: {
            id: true,
            name: true,
          },
        },
        docente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
      },
    }) as unknown as CalificacionWithRelations;
  }

  async actualizarCalificacion(
    id: string,
    updateCalificacionDto: UpdateCalificacionDto,
    userId: string,
    userRole: UserRole
  ) {
    // Log the start of the update process
    this.logger.log(`=== Iniciando actualización de calificación ${id} ===`);
    this.logger.log(`Datos recibidos: ${JSON.stringify(updateCalificacionDto, null, 2)}`);
    this.logger.log(`Usuario: ${userId}, Rol: ${userRole}`);

    // If updating calificacion, ensure tipoCalificacion is set to NUMERICA
    if (updateCalificacionDto.calificacion !== undefined && updateCalificacionDto.tipoCalificacion === undefined) {
      updateCalificacionDto.tipoCalificacion = TipoCalificacion.NUMERICA;
    }
    
    // If the DTO has a validate method, execute it
    if (typeof updateCalificacionDto.validate === 'function') {
      try {
        updateCalificacionDto.validate();
      } catch (error) {
        throw new BadRequestException(error.message);
      }
    }

    // Perform the update within a transaction
    return await this.prisma.$transaction(async (prisma) => {
      try {
        // 1. Get current record for logging and validation
        const currentRecord = await prisma.calificacion.findUnique({
          where: { id },
          include: {
            materia: true,
            estudiante: true,
            periodo: true,
            docente: true,
          },
        });

        if (!currentRecord) {
          throw new NotFoundException('Calificación no encontrada');
        }

        // 2. Verify permissions
        if (userRole !== UserRole.ADMIN && currentRecord.docenteId !== userId) {
          throw new UnauthorizedException('No tiene permiso para actualizar esta calificación');
        }

        // 3. If changing the subject or period, verify the teacher has permission
        if (updateCalificacionDto.materiaId || updateCalificacionDto.periodoId) {
          const tienePermiso = await prisma.userMateria.findFirst({
            where: {
              docenteId: userId,
              materiaId: updateCalificacionDto.materiaId || currentRecord.materiaId,
              periodoAcademicoId: updateCalificacionDto.periodoId || currentRecord.periodoId,
            },
          });

          if (!tienePermiso) {
            throw new UnauthorizedException('No tiene permiso para calificar esta materia');
          }
        }

        // 4. Log current state
        this.logger.log('📋 Estado actual de la calificación:', {
          id: currentRecord.id,
          calificacion: currentRecord.calificacion,
          tipoCalificacion: currentRecord.tipoCalificacion,
          valorConceptual: currentRecord.valorConceptual,
          updatedAt: currentRecord.updatedAt.toISOString()
        });

        // 5. Prepare update data
        const updateData: any = {
          updatedAt: new Date() // Force update timestamp
        };

        // Handle grade update
        if (updateCalificacionDto.calificacion !== undefined) {
          updateData.calificacion = updateCalificacionDto.calificacion;
          updateData.tipoCalificacion = 'NUMERICA';
          updateData.valorConceptual = null; // Clear conceptual value when setting numeric grade
          this.logger.log(`🔢 Actualizando calificación numérica a: ${updateCalificacionDto.calificacion}`);
        }

        // Handle tipoCalificacion if explicitly provided
        if (updateCalificacionDto.tipoCalificacion !== undefined) {
          updateData.tipoCalificacion = updateCalificacionDto.tipoCalificacion;
          
          // If changing to CONCEPTUAL, clear the numeric grade
          if (updateCalificacionDto.tipoCalificacion === 'CONCEPTUAL') {
            updateData.calificacion = null;
            if (updateCalificacionDto.valorConceptual === undefined) {
              throw new BadRequestException('Se requiere un valor conceptual');
            }
          }
        }

        // Handle valorConceptual if provided
        if (updateCalificacionDto.valorConceptual !== undefined) {
          updateData.valorConceptual = updateCalificacionDto.valorConceptual;
          updateData.tipoCalificacion = 'CONCEPTUAL';
          updateData.calificacion = null; // Clear numeric grade when setting conceptual value
          this.logger.log(`📝 Actualizando valor conceptual a: ${updateCalificacionDto.valorConceptual}`);
        }

        // Update other fields if provided
        if (updateCalificacionDto.comentario !== undefined) {
          updateData.comentario = updateCalificacionDto.comentario;
        }
        if (updateCalificacionDto.tipoEvaluacion) {
          updateData.tipoEvaluacion = updateCalificacionDto.tipoEvaluacion;
        }

        // 6. Log the update data
        this.logger.log('🔄 Datos para actualizar:', updateData);

        // 7. Perform the update
        const updated = await prisma.calificacion.update({
          where: { id },
          data: updateData,
          include: {
            estudiante: { select: { id: true, nombre: true, apellido: true } },
            materia: { select: { id: true, nombre: true } },
            periodo: { select: { id: true, name: true } },
            docente: { select: { id: true, nombre: true, apellido: true } },
          },
        });

        // 8. Verify the update
        const verifyRecord = await prisma.calificacion.findUnique({
          where: { id },
          select: {
            id: true,
            calificacion: true,
            tipoCalificacion: true,
            valorConceptual: true,
            updatedAt: true
          }
        });

        if (!verifyRecord) {
          throw new Error('No se pudo verificar la actualización de la calificación');
        }

        this.logger.log('✅ Verificación después de actualizar:', {
          ...verifyRecord,
          updatedAt: verifyRecord.updatedAt.toISOString()
        });

        // 9. Log the complete updated record
        this.logger.log('📊 Registro completo actualizado:', JSON.stringify(updated, null, 2));

        return updated;
      } catch (error) {
        this.logger.error('❌ Error al actualizar calificación:', {
          error: error.message,
          stack: error.stack,
          code: error.code,
          meta: error.meta
        });
        
        if (error.code) {
          this.logger.error(`Código de error de Prisma: ${error.code}`);
          this.logger.error(`Meta: ${JSON.stringify(error.meta)}`);
        }
        
        // Re-lanzar el error para que sea manejado por el manejador de errores global
        throw error;
      }
    });
  }

  async obtenerCalificacionesEstudiante(
    estudianteId: string,
    periodoId?: string
  ) {
    const where: any = { estudianteId };
    if (periodoId) {
      where.periodoId = periodoId;
    }

    return this.prisma.calificacion.findMany({
      where,
      include: {
        materia: true,
        periodo: true,
        docente: {
          select: {
            id: true,
            nombre: true,
            apellido: true
          }
        }
      },
      orderBy: {
        tipoEvaluacion: 'asc'
      }
    });
  }

  async eliminarCalificacion(usuarioId: string, calificacionId: string) {
    // Verificar si la calificación existe
    const calificacion = await this.prisma.calificacion.findUnique({
      where: { id: calificacionId },
      include: { docente: true }
    });

    if (!calificacion) {
      throw new NotFoundException('Calificación no encontrada');
    }

    // Verificar permisos (solo el docente que la creó o un admin puede borrarla)
    if (calificacion.docenteId !== usuarioId) {
      const usuario = await this.prisma.user.findUnique({
        where: { id: usuarioId }
      });
      
      if (usuario?.rol !== UserRole.ADMIN) {
        throw new UnauthorizedException('No tienes permiso para eliminar esta calificación');
      }
    }

    // Eliminar la calificación
    return this.prisma.calificacion.delete({
      where: { id: calificacionId }
    });
  }


  async obtenerCalificacionesPorMateria(
    materiaId: string,
    periodoId: string,
    tipoEvaluacion?: string
  ) {
    console.log('Buscando calificaciones para:', { 
      materiaId, 
      periodoId, 
      tipoEvaluacion 
    });

    const where: any = {
      materiaId,
      OR: [
        { periodoId: periodoId },
        { tipoEvaluacion: periodoId }
      ]
    };

    console.log('Query where clause:', JSON.stringify(where, null, 2));

    try {
      const calificaciones = await this.prisma.calificacion.findMany({
        where,
        include: {
          estudiante: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              grados: true  // Incluir información de grados del estudiante
            }
          },
          docente: {
            select: {
              id: true,
              nombre: true,
              apellido: true
            }
          },
          materia: {
            select: {
              id: true,
              nombre: true,
              tipoMateria: true
            }
          }
        },
        orderBy: {
          estudiante: {
            apellido: 'asc'
          }
        }
      });
      
      return calificaciones;
    } catch (error) {
      console.error('Error al obtener calificaciones por materia:', error);
      throw new Error('Error al obtener las calificaciones');
    }
  }

  
  async obtenerCalificacionesPorMateriaYGrado(
    docenteId: string,
    materiaId: string,
    grado: string,
    nivel: string = 'Básico',
    periodoId: string,
    seccion?: string
  ) {
    console.log('🔍 [obtenerCalificacionesPorMateriaYGrado] Parámetros:', {
      docenteId,
      materiaId,
      grado,
      nivel,
      periodoId
    });

    // 1. Verificar que el docente imparte la materia
    const imparteMateria = await this.prisma.userMateria.findFirst({
      where: {
        docenteId: docenteId,
        materiaId: materiaId,
        periodoAcademicoId: periodoId
      }
    });

    console.log('🔍 [obtenerCalificacionesPorMateriaYGrado] Docente imparte materia:', !!imparteMateria);

    if (!imparteMateria) {
      throw new UnauthorizedException('No tiene permiso para ver estas calificaciones o la materia no está asignada en este período');
    }

    // 2. Buscar estudiantes en el grado especificado
    // Crear diferentes variaciones para manejar múltiples formatos
    const gradoVariations: string[] = [];
    
    // Extraer el número de grado (1, 2, 3, etc.)
    const numeroGrado = grado.split('°')[0].trim();
    
    // Formatear el grado según los patrones vistos en la base de datos
    const formatosGrado: string[] = [];
    
    // Si el grado ya incluye el nivel (ej: '1° Básico'), usarlo directamente
    if (grado.includes(nivel)) {
      // Formato con comillas y sección: "1° Básico A"
      if (seccion) {
        formatosGrado.push(`"${grado} ${seccion}"`);
        formatosGrado.push(`${grado} ${seccion}`);
      }
      // Formato sin sección: "1° Básico" o 1° Básico
      formatosGrado.push(`"${grado}"`);
      formatosGrado.push(grado);
    } else {
      // Si el grado no incluye el nivel, construirlo
      const gradoCompleto = `${numeroGrado}° ${nivel}`;
      if (seccion) {
        formatosGrado.push(`"${gradoCompleto} ${seccion}"`);
        formatosGrado.push(`${gradoCompleto} ${seccion}`);
      }
      formatosGrado.push(`"${gradoCompleto}"`);
      formatosGrado.push(gradoCompleto);
    }
    
    // Si es un grado de básico, agregar variaciones con secciones A, B, C
    if (nivel === 'Básico' && !seccion) {
      ['A', 'B', 'C'].forEach(sec => {
        formatosGrado.push(`"${numeroGrado}° ${nivel} ${sec}"`);
        formatosGrado.push(`${numeroGrado}° ${nivel} ${sec}`);
      });
    }
    
    // Eliminar duplicados
    gradoVariations.push(...new Set(formatosGrado));
    
    console.log('🔍 [obtenerCalificacionesPorMateriaYGrado] Buscando en variantes de grado:', {
      grado,
      nivel,
      seccion,
      variaciones: gradoVariations
    });

    console.log('🔍 [obtenerCalificacionesPorMateriaYGrado] Buscando estudiantes en grados:', gradoVariations);

    // Primero buscar estudiantes activos en los grados especificados
    const estudiantes = await this.prisma.student.findMany({
      where: {
        AND: [
          {
            OR: gradoVariations.map(gradoVar => ({
              grados: {
                has: gradoVar
              }
            }))
          },
          { activo: true }
        ]
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        dni: true,
        email: true,
        grados: true
      },
      orderBy: [
        { apellido: 'asc' },
        { nombre: 'asc' }
      ]
    });

    console.log('🔍 [obtenerCalificacionesPorMateriaYGrado] Estudiantes encontrados:', estudiantes.length);

    if (estudiantes.length === 0) {
      console.log('⚠️ [obtenerCalificacionesPorMateriaYGrado] No se encontraron estudiantes en los grados:', gradoVariations);
      return [];
    }

    const estudianteIds = estudiantes.map(e => e.id);
    console.log('🔍 [obtenerCalificacionesPorMateriaYGrado] IDs de estudiantes:', estudianteIds);

    // 3. Si no hay estudiantes, devolver array vacío
    if (estudiantes.length === 0) {
      console.log('⚠️ [obtenerCalificacionesPorMateriaYGrado] No se encontraron estudiantes activos en los grados:', {
        gradoVariations,
        totalEstudiantes: 0
      });
      return [];
    }
    
    console.log(`✅ [obtenerCalificacionesPorMateriaYGrado] ${estudiantes.length} estudiantes encontrados en los grados:`, gradoVariations);

    // 3. Obtener calificaciones de los estudiantes con sus relaciones
    console.log('🔍 [obtenerCalificacionesPorMateriaYGrado] Buscando calificaciones para:', {
      estudianteIds: estudiantes.map(e => e.id),
      materiaId,
      periodoId,
      totalEstudiantes: estudiantes.length
    });

    const calificaciones = await this.prisma.calificacion.findMany({
      where: {
        estudianteId: {
          in: estudiantes.map(est => est.id)
        },
        materiaId: materiaId,
        periodoId: periodoId
      },
      include: {
        materia: {
          select: {
            id: true,
            nombre: true,
            tipoMateria: true
          }
        },
        periodo: true, // Incluir el período completo
        docente: {
          select: {
            id: true,
            nombre: true,
            apellido: true
          }
        }
      }
    });

    console.log('📊 [obtenerCalificacionesPorMateriaYGrado] Calificaciones encontradas:', {
      count: calificaciones.length,
      calificaciones: calificaciones.map(c => ({
        id: c.id,
        estudianteId: c.estudianteId,
        materiaId: c.materiaId,
        periodoId: c.periodoId,
        calificacion: c.calificacion,
        tipoCalificacion: c.tipoCalificacion,
        tipoEvaluacion: c.tipoEvaluacion
      }))
    });

    // 4. Combinar la información
    const resultado = estudiantes.map(estudiante => {
      console.log('🔍 [obtenerCalificacionesPorMateriaYGrado] Procesando calificaciones para estudiante:', {
        estudianteId: estudiante.id,
        totalCalificaciones: calificaciones.length,
        calificacionesFiltradas: calificaciones.filter(c => c.estudianteId === estudiante.id).length
      });

      const calificacionesEstudiante = calificaciones
        .filter(c => {
          const matches = c.estudianteId === estudiante.id;
          console.log('🔍 [Filtro] Comparando calificación:', {
            calificacionId: c.id,
            calificacionEstudianteId: c.estudianteId,
            estudianteId: estudiante.id,
            matches
          });
          return matches;
        })
        .map(c => {
          console.log('📝 Mapeando calificación:', {
            id: c.id,
            estudianteId: c.estudianteId,
            materiaId: c.materiaId,
            calificacion: c.calificacion
          });
          return {
            id: c.id,
            calificacion: c.calificacion,
            tipoCalificacion: c.tipoCalificacion,
            valorConceptual: c.valorConceptual,
            fecha: c.fecha,
            comentario: c.comentario,
            tipoEvaluacion: c.tipoEvaluacion,
            materia: {
              id: c.materiaId,
              nombre: c.materia?.nombre || 'Materia no encontrada',
              tipoMateria: c.materia?.tipoMateria || 'Sin tipo'
            },
            periodo: {
              ...c.periodo, // Incluir todas las propiedades del período
              id: c.periodoId // Asegurar que el ID sea el correcto
            },
            docente: c.docente
          };
        });

      console.log('✅ Calificaciones procesadas para el estudiante:', {
        estudianteId: estudiante.id,
        totalCalificaciones: calificacionesEstudiante.length,
        calificaciones: calificacionesEstudiante.map(c => ({
          id: c.id,
          calificacion: c.calificacion,
          tipoEvaluacion: c.tipoEvaluacion
        }))
      });

      return {
        estudiante: {
          id: estudiante.id,
          nombre: estudiante.nombre,
          apellido: estudiante.apellido || '',
          dni: estudiante.dni || '',
          email: estudiante.email || '',
          grado: estudiante.grados.find(g => 
            gradoVariations.some(variation => g.includes(variation))
          ) || estudiante.grados[0] || ''
        },
        calificaciones: calificacionesEstudiante,
        promedio: this.calcularPromedio(calificacionesEstudiante)
      };
    });

    return resultado;
  }

  private calcularPromedio(calificaciones: any[]): number {
    if (!calificaciones || !Array.isArray(calificaciones) || calificaciones.length === 0) {
      return 0;
    }
    const suma = calificaciones.reduce((acc, cal) => {
      return acc + (cal && cal.calificacion ? Number(cal.calificacion) : 0);
    }, 0);
    return parseFloat((suma / calificaciones.length).toFixed(2));
  }

  async obtenerPromedioEstudiante(
    estudianteId: string,
    periodoId: string
  ) {
    try {
      const calificaciones = await this.prisma.calificacion.groupBy({
        by: ['materiaId'],
        where: {
          estudianteId,
          periodoId,
          tipoCalificacion: 'NUMERICA',
          calificacion: { not: null }
        },
        _avg: {
          calificacion: true
        }
      });

      if (calificaciones.length === 0) {
        return {
          promedio: 0,
          totalMaterias: 0,
          calificaciones: []
        };
      }

      const promedios = calificaciones.map(c => ({
        materiaId: c.materiaId,
        promedio: c._avg.calificacion || 0
      }));

      const promedioGeneral = promedios.reduce((sum, c) => sum + c.promedio, 0) / promedios.length;

      // Obtener información adicional de las materias
      const materias = await this.prisma.materia.findMany({
        where: {
          id: { in: promedios.map(p => p.materiaId) }
        },
        include: {
          tipoMateria: true
        }
      });

      return {
        promedio: parseFloat(promedioGeneral.toFixed(2)),
        totalMaterias: promedios.length,
        calificaciones: promedios.map(p => {
          const materia = materias.find(m => m.id === p.materiaId);
          return {
            materiaId: p.materiaId,
            nombreMateria: materia?.nombre || 'Materia desconocida',
            promedio: p.promedio,
            esExtraescolar: materia?.tipoMateria?.nombre === 'EXTRACURRICULAR' || false
          };
        })
      };
    } catch (error) {
      console.error('Error al calcular el promedio del estudiante:', error);
      throw new Error('Error al calcular el promedio del estudiante');
    }
  }
}