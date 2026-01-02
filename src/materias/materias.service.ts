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

    // Obtener el período académico actual
    const currentPeriod = await this.prisma.periodoAcademico.findFirst({
      where: { isCurrent: true }
    });

    if (!currentPeriod) {
      throw new NotFoundException('No se encontró un período académico activo');
    }

    try {
      return await this.prisma.userMateria.create({
        data: {
          docenteId: userId,
          materiaId: asignarMateriaDto.materiaId,
          seccion: asignarMateriaDto.seccion,
          horario: asignarMateriaDto.horario,
          periodo: currentPeriod.name, // Usar el nombre del período actual
          periodoAcademicoId: currentPeriod.id, // Agregar el ID del período académico
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Esta asignación ya existe');
      }
      throw error;
    }
  }

  async getMateriasByDocente(userId: string) {
    return this.prisma.userMateria.findMany({
      where: { docenteId: userId },
      include: { materia: true },
    });
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
