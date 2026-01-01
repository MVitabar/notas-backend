import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Student } from '@prisma/client';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  private mapStudentData(studentData: any) {
    // Only include fields that exist in the Prisma Student model
    const mappedData: any = {
      nombre: studentData.nombre,
      apellido: studentData.apellido,
      fechaNacimiento: studentData.fechaNacimiento,
      dni: studentData.dni,
      direccion: studentData.direccion,
      telefono: studentData.telefono,
      // Map frontend fields to backend fields
      contactoEmergencia:
        studentData.emergencyContact || studentData.contactoEmergencia,
      telefonoEmergencia:
        studentData.emergencyPhone ||
        studentData.telefonoEmergencia ||
        studentData.parentPhone,
      email: studentData.email || studentData.correoElectronico,
      activo: studentData.activo !== undefined ? studentData.activo : true,
      grados: studentData.grados || [],
      materias: studentData.materias || [],
    };

    // Only include defined values to avoid overriding defaults
    Object.keys(mappedData).forEach((key) => {
      if (mappedData[key] === undefined) {
        delete mappedData[key];
      }
    });

    return mappedData;
  }

  async create(createStudentDto: CreateStudentDto): Promise<Student> {
    try {
      // Check if student with DNI already exists
      const existingStudent = await this.prisma.student.findUnique({
        where: { dni: createStudentDto.dni },
      });

      if (existingStudent) {
        throw new ConflictException('Ya existe un estudiante con este DNI');
      }

      // Map and prepare the data
      const studentData = this.mapStudentData(createStudentDto);

      // Create the student
      return await this.prisma.student.create({
        data: {
          ...studentData,
          fechaNacimiento: studentData.fechaNacimiento
            ? new Date(studentData.fechaNacimiento)
            : null,
        },
      });
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al crear el estudiante');
    }
  }

  async findAll(
    grado?: string,
    nivel?: string,
    seccion?: string,
  ): Promise<
    Array<{
      id: string;
      nombre: string;
      apellido: string;
      email: string | null;
      grados: string[];
      dni: string | null;
      activo: boolean;
      secciones: string[];
    }>
  > {
    return this.findByGrado(grado, nivel, seccion);
  }

  async findByGrado(
    grado?: string,
    nivel?: string,
    seccion?: string,
  ): Promise<
    Array<{
      id: string;
      nombre: string;
      apellido: string;
      email: string | null;
      grados: string[];
      dni: string | null;
      activo: boolean;
      secciones: string[];
      fechaNacimiento?: string | null;
    }>
  > {
    // Primero obtenemos todos los estudiantes que coincidan con el grado
    const gradoFilter: any = {};

    if (grado) {
      if (nivel) {
        const gradoNivel = `${grado}° ${nivel}`.trim();
        gradoFilter.OR = [
          { grados: { has: gradoNivel } },
          { grados: { has: `${grado}°` } },
          { grados: { has: grado } },
        ];
      } else {
        gradoFilter.OR = [
          { grados: { has: `${grado}°` } },
          { grados: { has: grado } },
        ];
      }
    }

    // Definir el tipo para los datos de sección
    type SeccionData = {
      materiaId: string;
      seccion: string;
      materia: {
        id: string;
        nombre: string;
      };
    };

    // Obtenemos las secciones primero si se especificó una sección
    let seccionesData: SeccionData[] = [];
    if (seccion) {
      seccionesData = (await this.prisma.userMateria.findMany({
        where: {
          seccion: seccion.toUpperCase(),
        },
        select: {
          materiaId: true,
          seccion: true,
          materia: {
            select: {
              id: true,
              nombre: true,
            },
          },
        },
      })) as SeccionData[];
    }

    const materiasIds = seccionesData.map((m) => m.materiaId);

    // Obtenemos los estudiantes con sus calificaciones
    const estudiantes = await this.prisma.student.findMany({
      where: {
        ...gradoFilter,
        activo: true,
        ...(materiasIds.length > 0 && {
          calificaciones: {
            some: {
              materiaId: { in: materiasIds },
            },
          },
        }),
      },
      include: {
        calificaciones: {
          where:
            materiasIds.length > 0
              ? { materiaId: { in: materiasIds } }
              : undefined,
          include: {
            materia: true,
            periodo: true,
          },
        },
      },
      orderBy: [{ apellido: 'asc' }, { nombre: 'asc' }],
    });

    // Mapeamos los resultados al formato esperado
    return estudiantes.map((estudiante) => {
      // Obtenemos las secciones únicas del estudiante
      const seccionesEstudiante = Array.from(
        new Set(
          estudiante.calificaciones
            .map((calif) => {
              const seccionData = seccionesData.find(
                (s) => s.materiaId === calif.materiaId,
              );
              return seccionData?.seccion;
            })
            .filter((seccion): seccion is string => seccion !== undefined),
        ),
      );

      return {
        id: estudiante.id,
        nombre: estudiante.nombre,
        apellido: estudiante.apellido || '',
        email: estudiante.email,
        grados: estudiante.grados || [],
        dni: estudiante.dni || null,
        activo: estudiante.activo !== undefined ? estudiante.activo : true,
        secciones: seccionesEstudiante,
        fechaNacimiento: estudiante.fechaNacimiento?.toISOString().split('T')[0] || null,
      };
    });
  }

  async findOne(id: string): Promise<Student> {
    const student = await this.prisma.student.findUnique({
      where: { id },
    });

    if (!student) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    return student;
  }

  async findOneWithGrades(id: string) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: {
        calificaciones: {
          include: {
            materia: {
              select: {
                id: true,
                nombre: true,
                tipoMateria: true,
              },
            },
            periodo: {
              select: {
                id: true,
                name: true,
                startDate: true,
                endDate: true,
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
          orderBy: {
            periodo: {
              startDate: 'desc',
            },
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException(`Estudiante con ID ${id} no encontrado`);
    }

    return student;
  }

  async update(
    id: string,
    updateStudentDto: UpdateStudentDto,
  ): Promise<Student> {
    try {
      const updateData: any = { ...updateStudentDto };

      // Handle email - if it's empty string or null, remove it from update data
      if (updateData.email === '' || updateData.email === null) {
        delete updateData.email;
      }
      
      // Also handle the Spanish alias for email
      if (updateData.correoElectronico === '' || updateData.correoElectronico === null) {
        delete updateData.correoElectronico;
      }

      if (updateStudentDto.fechaNacimiento) {
        updateData.fechaNacimiento = new Date(updateStudentDto.fechaNacimiento);
      }

      const student = await this.prisma.student.update({
        where: { id },
        data: updateData,
      });

      return student;
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Estudiante no encontrado');
      }
      throw new InternalServerErrorException(
        'Error al actualizar el estudiante',
      );
    }
  }

  async remove(id: string): Promise<{ success: boolean }> {
    try {
      await this.prisma.student.delete({
        where: { id },
      });
      return { success: true };
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Estudiante no encontrado');
      }
      throw new InternalServerErrorException('Error al eliminar el estudiante');
    }
  }
}
