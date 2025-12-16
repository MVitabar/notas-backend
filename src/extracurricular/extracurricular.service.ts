import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateExtracurricularDto } from './dto/create-extracurricular.dto';
import { UpdateExtracurricularDto } from './dto/update-extracurricular.dto';

@Injectable()
export class ExtracurricularService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(createExtracurricularDto: CreateExtracurricularDto) {
    // Find or create the EXTRACURRICULAR type
    let tipo = await this.prisma.tipoMateria.findFirst({
      where: { nombre: 'EXTRACURRICULAR' }
    });

    if (!tipo) {
      tipo = await this.prisma.tipoMateria.create({
        data: {
          nombre: 'EXTRACURRICULAR',
          descripcion: 'Actividades extracurriculares'
        }
      });
    }

    // Create the new activity
    return this.prisma.materia.create({
      data: {
        nombre: createExtracurricularDto.nombre,
        codigo: createExtracurricularDto.codigo,
        descripcion: createExtracurricularDto.descripcion || '',
        creditos: 0, // Extracurricular activities typically don't have credits
        activa: createExtracurricularDto.activa !== false, // Default to true
        tipoMateriaId: tipo.id
      },
      include: {
        tipoMateria: true
      }
    });
  }

  async findAll() {
    return this.prisma.materia.findMany({
      where: {
        tipoMateria: {
          nombre: 'EXTRACURRICULAR'
        }
      },
      include: {
        tipoMateria: true
      },
      orderBy: {
        nombre: 'asc'
      }
    });
  }

  async findOne(id: string) {
    const activity = await this.prisma.materia.findUnique({
      where: { id },
      include: {
        tipoMateria: true
      }
    });

    if (!activity || activity.tipoMateria?.nombre !== 'EXTRACURRICULAR') {
      throw new NotFoundException('Actividad extracurricular no encontrada');
    }

    return activity;
  }

  async update(id: string, updateExtracurricularDto: UpdateExtracurricularDto) {
    // Verify the activity exists and is an extracurricular activity
    await this.findOne(id);

    return this.prisma.materia.update({
      where: { id },
      data: {
        ...updateExtracurricularDto,
        updatedAt: new Date()
      },
      include: {
        tipoMateria: true
      }
    });
  }

  async remove(id: string) {
    // Verify the activity exists and is an extracurricular activity
    await this.findOne(id);

    // Check if there are any grades for this activity
    const grades = await this.prisma.calificacion.findFirst({
      where: { materiaId: id }
    });

    if (grades) {
      // Instead of deleting, we'll deactivate the activity
      return this.prisma.materia.update({
        where: { id },
        data: {
          activa: false,
          updatedAt: new Date()
        },
        include: {
          tipoMateria: true
        }
      });
    }

    // If no grades exist, we can safely delete the activity
    return this.prisma.materia.delete({
      where: { id },
      include: {
        tipoMateria: true
      }
    });
  }
}
