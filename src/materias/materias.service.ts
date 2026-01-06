import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';
import { CreateMateriaDto } from './dto/create-materia.dto';
import { AsignarMateriaDto } from './dto/asignar-materia.dto';

@Injectable()
export class MateriasService {
  constructor(private prisma: PrismaService) {}

  async create(createMateriaDto: CreateMateriaDto) {
    try {
      const data: any = { ...createMateriaDto };
      
      // Only include tipoMateria if tipoMateriaId is provided
      if (createMateriaDto.tipoMateriaId) {
        data.tipoMateria = {
          connect: { id: createMateriaDto.tipoMateriaId }
        };
        delete data.tipoMateriaId; // Remove the ID field as we're using the relation
      }
      
      return await this.prisma.materia.create({
        data,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Materia con este código o nombre ya existe');
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.materia.findMany({
      where: { activa: true },
    });
  }

  async findAllTiposMateria() {
    return this.prisma.tipoMateria.findMany({
      orderBy: { nombre: 'asc' }
    });
  }

  async findOne(id: string) {
    const materia = await this.prisma.materia.findUnique({
      where: { id },
    });

    if (!materia) {
      throw new NotFoundException(`Materia con ID ${id} no encontrada`);
    }

    return materia;
  }

  async asignarMateria(userId: string, asignarMateriaDto: AsignarMateriaDto) {
    // Verificar si el usuario existe y es docente
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { perfilDocente: true },
    });

    if (!user || user.rol !== UserRole.DOCENTE || !user.perfilDocente) {
      throw new NotFoundException('Usuario docente no encontrado');
    }

    // Verificar si la materia existe
    await this.findOne(asignarMateriaDto.materiaId);

    // Obtener todos los períodos académicos
    const allPeriods = await this.prisma.periodoAcademico.findMany({
      // No filtrar por status, incluir todos los períodos
    });

    if (allPeriods.length === 0) {
      throw new NotFoundException('No se encontraron períodos académicos');
    }

    try {
      // Crear relaciones para todos los períodos
      const userMateriaData = allPeriods.map(periodo => ({
        docenteId: userId,
        materiaId: asignarMateriaDto.materiaId,
        seccion: asignarMateriaDto.seccion,
        horario: asignarMateriaDto.horario,
        periodo: periodo.name,
        periodoAcademicoId: periodo.id,
        estado: 'activo'
      }));

      const result = await this.prisma.userMateria.createMany({
        data: userMateriaData,
        skipDuplicates: true
      });

      // Retornar la primera relación creada para mantener compatibilidad
      const firstRelation = await this.prisma.userMateria.findFirst({
        where: {
          docenteId: userId,
          materiaId: asignarMateriaDto.materiaId,
        },
        include: {
          materia: true,
          periodoAcademico: true
        }
      });

      return firstRelation;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Esta asignación ya existe');
      }
      throw error;
    }
  }

  async getMateriasByDocente(userId: string) {
    const userMaterias = await this.prisma.userMateria.findMany({
      where: { docenteId: userId },
      include: { 
        materia: true,
        periodoAcademico: true
      },
    });

    // Agrupar por materia para evitar duplicados
    const materiasUnicas = userMaterias.reduce((acc, userMateria) => {
      const materiaId = userMateria.materiaId;
      
      // Si no hemos agregado esta materia aún, la agregamos
      if (!acc[materiaId]) {
        acc[materiaId] = {
          id: userMateria.materia.id,
          nombre: userMateria.materia.nombre,
          codigo: userMateria.materia.codigo,
          activa: userMateria.materia.activa,
          descripcion: userMateria.materia.descripcion,
          creditos: userMateria.materia.creditos,
          esExtracurricular: userMateria.materia.esExtracurricular,
          tipoMateriaId: userMateria.materia.tipoMateriaId,
          orden: userMateria.materia.orden,
          grados: userMateria.materia.grados,
          createdAt: userMateria.materia.createdAt,
          updatedAt: userMateria.materia.updatedAt,
          // Agregar información de períodos para referencia
          periodosAsignados: userMaterias
            .filter(um => um.materiaId === materiaId)
            .map(um => ({
              id: um.periodoAcademico.id,
              name: um.periodoAcademico.name,
              isCurrent: um.periodoAcademico.isCurrent,
              status: um.periodoAcademico.status
            }))
        };
      }
      
      return acc;
    }, {} as Record<string, any>);

    // Convertir a array
    return Object.values(materiasUnicas);
  }

  async removeAsignacion(userId: string, asignacionId: string) {
    try {
      return await this.prisma.userMateria.delete({
        where: { id: asignacionId, docenteId: userId },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Asignación no encontrada');
      }
      throw error;
    }
  }

  /**
   * Encuentra un tipo de materia por su ID
   */
  async findTipoMateriaById(id: string) {
    return this.prisma.tipoMateria.findUnique({
      where: { id },
    });
  }

  /**
   * Encuentra o crea el tipo de materia extracurricular
   */
  async findOrCreateTipoExtracurricular() {
    let tipo = await this.prisma.tipoMateria.findFirst({
      where: { nombre: 'EXTRACURRICULAR' },
    });

    if (!tipo) {
      tipo = await this.prisma.tipoMateria.create({
        data: {
          nombre: 'EXTRACURRICULAR',
          descripcion: 'Actividades extracurriculares',
        },
      });
    }

    return tipo;
  }
}
