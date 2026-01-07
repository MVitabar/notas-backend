import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Query, 
  UseGuards, 
  Req, 
  Delete, 
  Put, 
  UnauthorizedException, 
  BadRequestException, 
  UsePipes, 
  ValidationPipe, 
  Logger
} from '@nestjs/common';
import { CalificacionesService } from './calificaciones.service';
import { CreateCalificacionDto } from './dto/create-calificacion.dto';
import { UpdateCalificacionDto } from './dto/update-calificacion.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: {
    userId: string;  // Changed from id to userId to match JWT strategy
    rol: UserRole;
    email?: string;
    requiresPasswordChange?: boolean;
  };
}

@Controller('calificaciones')
@UseGuards(JwtAuthGuard)
export class CalificacionesController {
  private readonly logger = new Logger(CalificacionesController.name);

  constructor(private readonly calificacionesService: CalificacionesService) {}

  @Post()
  @Roles(UserRole.DOCENTE, UserRole.ADMIN)
  @UsePipes(new ValidationPipe({ transform: true }))
  async crear(
    @Req() req: RequestWithUser,
    @Body() createCalificacionDto: CreateCalificacionDto
  ) {
    this.logger.debug(`Creando calificación: ${JSON.stringify(createCalificacionDto)}`);
    
    if (!req.user?.userId) {
      this.logger.error('Intento de acceso no autorizado: Usuario no autenticado');
      throw new UnauthorizedException('Usuario no autenticado');
    }

    try {
      this.logger.log(`Usuario ${req.user.userId} intentando crear una calificación`);
      
      const result = await this.calificacionesService.crearCalificacion(
        req.user.userId,
        createCalificacionDto
      );
      
      this.logger.log(`Calificación creada exitosamente por el usuario ${req.user.userId}`);
      return result;
    } catch (error) {
      this.logger.error(`Error al crear calificación: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Put(':id')
  @Roles(UserRole.DOCENTE, UserRole.ADMIN)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
  async actualizar(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() updateCalificacionDto: UpdateCalificacionDto
  ) {
    this.logger.log(`Iniciando actualización de calificación ${id} por usuario ${req.user.userId}`);
    this.logger.debug(`Datos recibidos: ${JSON.stringify(updateCalificacionDto, null, 2)}`);
    
    try {
      // Crear una nueva instancia del DTO y copiar las propiedades
      const dtoWithId = new UpdateCalificacionDto();
      Object.assign(dtoWithId, updateCalificacionDto);
      dtoWithId.id = id;
      
      // Validar el DTO si el método validate existe
      if (dtoWithId.validate) {
        dtoWithId.validate();
      }
      
      const result = await this.calificacionesService.actualizarCalificacion(
        id,
        dtoWithId,
        req.user.userId,
        req.user.rol
      );
      
      this.logger.log(`Calificación ${id} actualizada exitosamente`);
      return result;
    } catch (error) {
      this.logger.error(`Error al actualizar calificación ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get('estudiante/:estudianteId')
  @Roles(UserRole.DOCENTE, UserRole.ADMIN, UserRole.USUARIO)
  obtenerDelEstudiante(
    @Req() req: RequestWithUser,
    @Param('estudianteId') estudianteId: string,
    @Query('periodoId') periodoId?: string
  ) {
    // Si es un usuario normal, solo puede ver sus propias calificaciones
    if (req.user.rol === UserRole.USUARIO && req.user.userId !== estudianteId) {
      throw new UnauthorizedException('No tiene permiso para ver estas calificaciones');
    }

    return this.calificacionesService.obtenerCalificacionesEstudiante(
      estudianteId,
      periodoId
    );
  }

  @Get('materia/:materiaId')
  @Roles(UserRole.DOCENTE, UserRole.ADMIN)
  obtenerPorMateria(
    @Req() req: RequestWithUser,
    @Param('materiaId') materiaId: string,
    @Query('periodoId') periodoId?: string,
    @Query('tipoEvaluacion') tipoEvaluacion?: string
  ) {
    if (!periodoId && !tipoEvaluacion) {
      throw new BadRequestException('Se requiere al menos periodoId o tipoEvaluacion');
    }
    
    // If tipoEvaluacion is provided but periodoId is not, use tipoEvaluacion as periodoId
    if (tipoEvaluacion && !periodoId) {
      console.log('Using tipoEvaluacion as periodoId');
      periodoId = tipoEvaluacion;
    }

    return this.calificacionesService.obtenerCalificacionesPorMateria(
      materiaId, 
      periodoId!,
      tipoEvaluacion
    );
  }

  @Get('promedio/:estudianteId')
  @Roles(UserRole.DOCENTE, UserRole.ADMIN, UserRole.USUARIO)
  obtenerPromedio(
    @Param('estudianteId') estudianteId: string,
    @Query('periodoId') periodoId: string,
    @Req() req: RequestWithUser
  ) {
    // Si es un usuario normal, solo puede ver sus propios promedios
    if (req.user.rol === UserRole.USUARIO && req.user.userId !== estudianteId) {
      throw new UnauthorizedException('No tiene permiso para ver estos promedios');
    }

    if (!periodoId) {
      throw new BadRequestException('El parámetro periodoId es requerido');
    }
    return this.calificacionesService.obtenerPromedioEstudiante(estudianteId, periodoId);
  }

  @Delete(':id')
  @Roles(UserRole.DOCENTE, UserRole.ADMIN)
  eliminar(
    @Param('id') id: string,
    @Req() req: RequestWithUser
  ) {
    return this.calificacionesService.eliminarCalificacion(req.user.userId, id);
  }

  @Get('profesor/materia-grado')
  @Roles(UserRole.DOCENTE)
  async getCalificacionesPorMateriaYGrado(
    @Req() req: RequestWithUser,
    @Query('materiaId') materiaId: string,
    @Query('grado') grado: string,
    @Query('periodoId') periodoId: string,
    @Query('nivel') nivel: string = 'Básico',
    @Query('seccion') seccion?: string
  ) {
    if (!materiaId || !grado || !periodoId) {
      throw new BadRequestException('Los parámetros materiaId, grado y periodoId son requeridos');
    }

    console.log('📝 [CalificacionesController] Buscando calificaciones con:', {
      docenteId: req.user.userId,
      materiaId,
      grado,
      nivel,
      periodoId,
      seccion
    });

    return this.calificacionesService.obtenerCalificacionesPorMateriaYGrado(
      req.user.userId,
      materiaId,
      grado,
      nivel,
      periodoId,
      seccion
    );
  }
}
