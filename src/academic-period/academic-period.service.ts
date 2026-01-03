import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAcademicPeriodDto } from './dto/create-academic-period.dto';
import { UpdateAcademicPeriodDto } from './dto/update-academic-period.dto';
import { PeriodoUnidadService } from './periodo-unidad.service';

@Injectable()
export class AcademicPeriodService {
  constructor(
    private prisma: PrismaService,
    private periodoUnidadService: PeriodoUnidadService
  ) {}

  async create(createAcademicPeriodDto: CreateAcademicPeriodDto) {
    if (createAcademicPeriodDto.isCurrent) {
      await this.prisma.periodoAcademico.updateMany({
        where: { isCurrent: true },
        data: { isCurrent: false },
      });
    }

    // Detectar y asignar unidad automáticamente
    const unidadAsignada = await this.periodoUnidadService.detectarYAsignarUnidad(
      createAcademicPeriodDto.name
    );

    // Ensure dates are properly formatted as ISO-8601
    const data = {
      ...createAcademicPeriodDto,
      startDate: new Date(createAcademicPeriodDto.startDate).toISOString(),
      endDate: new Date(createAcademicPeriodDto.endDate).toISOString(),
      unidadAsignada, // Nueva campo
    };

    return this.prisma.periodoAcademico.create({
      data,
    });
  }

  async findAll() {
    return this.prisma.periodoAcademico.findMany({
      orderBy: { startDate: 'desc' },
    });
  }

  async findCurrent() {
    return this.prisma.periodoAcademico.findFirst({
      where: { isCurrent: true },
    });
  }

  async findOne(id: string) {
    const period = await this.prisma.periodoAcademico.findUnique({
      where: { id },
    });

    if (!period) {
      throw new NotFoundException(`Academic period with ID ${id} not found`);
    }

    return period;
  }

  async update(id: string, updateAcademicPeriodDto: UpdateAcademicPeriodDto) {
    if (updateAcademicPeriodDto.isCurrent) {
      await this.prisma.periodoAcademico.updateMany({
        where: { isCurrent: true, NOT: { id } },
        data: { isCurrent: false },
      });
    }

    // Prepare update data with properly formatted dates if they exist
    const data: any = { ...updateAcademicPeriodDto };
    
    if (updateAcademicPeriodDto.startDate) {
      data.startDate = new Date(updateAcademicPeriodDto.startDate).toISOString();
    }
    
    if (updateAcademicPeriodDto.endDate) {
      data.endDate = new Date(updateAcademicPeriodDto.endDate).toISOString();
    }

    return this.prisma.periodoAcademico.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.periodoAcademico.delete({
      where: { id },
    });
  }
}
