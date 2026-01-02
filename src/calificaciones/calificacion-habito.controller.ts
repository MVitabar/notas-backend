import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards, 
  Req, 
  Query, 
  NotFoundException, 
  BadRequestException, 
  Put 
} from '@nestjs/common';
import { CalificacionHabitoService } from './calificacion-habito.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { HabitoEstudiante, ResumenHabitos } from './types/habitos.types';

@Controller('calificaciones-habitos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CalificacionHabitoController {
  constructor(
    private readonly calificacionHabitoService: CalificacionHabitoService
  ) {}

  @Get('estudiante/:estudianteId')
  @Roles(UserRole.DOCENTE, UserRole.ADMIN)
  async getCalificacionesPorEstudiante(
    @Param('estudianteId') estudianteId: string,
    @Query('periodoId') periodoId: string,
    @Req() req: any
  ): Promise<HabitoEstudiante[]> {
    if (!periodoId) {
      throw new BadRequestException('El parámetro periodoId es requerido');
    }

    try {
      return await this.calificacionHabitoService.obtenerCalificacionesPorEstudiante(
        estudianteId,
        periodoId
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error al obtener las calificaciones de hábitos');
    }
  }

  @Get('resumen')
  @Roles(UserRole.DOCENTE, UserRole.ADMIN, UserRole.ESTUDIANTE)
  async getResumenHabitos(
    @Query('estudianteId') estudianteId: string,
    @Query('periodoId') periodoId: string,
    @Req() req: any
  ): Promise<ResumenHabitos> {
    if (!periodoId) {
      throw new BadRequestException('El parámetro periodoId es requerido');
    }

    // Si es estudiante, solo puede ver sus propias calificaciones
    if (req.user.rol === UserRole.ESTUDIANTE && req.user.userId !== estudianteId) {
      throw new NotFoundException('No tienes permiso para ver estas calificaciones');
    }

    if (req.user.rol === UserRole.DOCENTE) {
      // Verificar si el docente tiene permiso para ver este estudiante
      const tienePermiso = await this.calificacionHabitoService.verificarPermisoDocente(
        req.user.userId,
        estudianteId
      );
      
      if (!tienePermiso) {
        throw new NotFoundException('No tiene permiso para ver las calificaciones de este estudiante');
      }
    }

    try {
      return await this.calificacionHabitoService.obtenerResumenHabitos(estudianteId, periodoId);
    } catch (error) {
      console.error('Error en getResumenHabitos:', error);
      throw new BadRequestException('Error al obtener el resumen de hábitos');
    }
  }

  @Put('estudiante/:estudianteId')
  @Roles(UserRole.DOCENTE, UserRole.ADMIN)
  async updateCalificacionesPorEstudiante(
    @Param('estudianteId') estudianteId: string,
    @Body() data: { 
      periodoId: string;
      calificaciones: Array<{
        evaluacionHabitoId: string;
        u1?: string | null;
        u2?: string | null;
        u3?: string | null;
        u4?: string | null;
        comentario?: string | null;
      }>;
    },
    @Req() req: any
  ) {
    if (!data.periodoId) {
      throw new BadRequestException('El parámetro periodoId es requerido');
    }

    try {
      // Obtener el ID del docente desde el token JWT
      const docenteId = req.user.userId;
      
      if (!docenteId) {
        throw new BadRequestException('No se pudo identificar al docente');
      }

      await this.calificacionHabitoService.actualizarCalificaciones(
        estudianteId,
        data.periodoId,
        data.calificaciones,
        docenteId
      );
      
      return { success: true, message: 'Calificaciones actualizadas correctamente' };
    } catch (error) {
      console.error('Error al actualizar calificaciones de hábitos:', error);
      throw new BadRequestException(
        error.message || 'Error al actualizar las calificaciones de hábitos'
      );
    }
  }

  @Post()
  @Roles(UserRole.DOCENTE, UserRole.ADMIN)
  async create(
    @Body() 
    data: { 
      estudianteId: string; 
      evaluacionHabitoId: string; 
      periodoId: string;
      u1?: string;
      u2?: string;
      u3?: string;
      u4?: string;
      comentario?: string;
      esExtraescolar?: boolean;
    },
    @Req() req
  ) {
    const { 
      estudianteId, 
      evaluacionHabitoId, 
      periodoId, 
      esExtraescolar,
      ...calificacionData 
    } = data;

    if (!estudianteId || !evaluacionHabitoId || !periodoId) {
      throw new BadRequestException(
        'Los campos estudianteId, evaluacionHabitoId y periodoId son requeridos'
      );
    }

    try {
      return await this.calificacionHabitoService.crearCalificacionHabito(
        estudianteId,
        evaluacionHabitoId,
        periodoId,
        req.user.userId,
        {
          ...calificacionData,
          esExtraescolar
        }
      );
    } catch (error) {
      console.error('Error al crear calificación de hábito:', error);
      throw new BadRequestException('Error al guardar la evaluación');
    }
  }

  @Put(':id')
  @Roles(UserRole.DOCENTE, UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() 
    data: { 
      u1?: string; 
      u2?: string; 
      u3?: string; 
      u4?: string; 
      comentario?: string;
      esExtraescolar?: boolean;
    },
    @Req() req
  ) {
    const { esExtraescolar, ...updateData } = data;
    
    try {
      return await this.calificacionHabitoService.actualizarCalificacionHabito(
        id,
        {
          ...updateData,
          ...(esExtraescolar !== undefined ? { esExtraescolar } : {})
        },
        req.user.userId
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error en update calificación hábito:', error);
      throw new BadRequestException('Error al actualizar la calificación de hábito');
    }
  }
}
