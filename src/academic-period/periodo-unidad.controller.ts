import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Param, 
  Body, 
  UseGuards,
  NotFoundException,
  BadRequestException
} from '@nestjs/common';
import { PeriodoUnidadService } from './periodo-unidad.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('periodo-unidad')
@UseGuards(JwtAuthGuard)
export class PeriodoUnidadController {
  constructor(private readonly periodoUnidadService: PeriodoUnidadService) {}

  @Get('periodo/:periodoId/unidad')
  @Roles(UserRole.DOCENTE, UserRole.ADMIN)
  async getUnidadPorPeriodo(@Param('periodoId') periodoId: string) {
    try {
      const unidad = await this.periodoUnidadService.getUnidadPorPeriodo(periodoId);
      return { unidad };
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Get('disponibles')
  @Roles(UserRole.ADMIN)
  async getUnidadesDisponibles() {
    const unidades = await this.periodoUnidadService.getUnidadesDisponibles();
    return { unidades };
  }

  @Get('todos')
  @Roles(UserRole.ADMIN, UserRole.DOCENTE)
  async getTodosLosPeriodosConUnidades() {
    const periodos = await this.periodoUnidadService.getTodosLosPeriodosConUnidades();
    return { periodos };
  }

  @Put('periodo/:periodoId/asignar-unidad')
  @Roles(UserRole.ADMIN)
  async reasignarUnidadPeriodo(
    @Param('periodoId') periodoId: string,
    @Body('unidad') unidad: string
  ) {
    try {
      const resultado = await this.periodoUnidadService.reasignarUnidadPeriodo(periodoId, unidad);
      return { message: 'Unidad reasignada exitosamente', periodo: resultado };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('probar-mapeo')
  @Roles(UserRole.ADMIN)
  async probarMapeo(@Body('nombrePeriodo') nombrePeriodo: string) {
    if (!nombrePeriodo) {
      throw new BadRequestException('El nombre del período es requerido');
    }

    try {
      const unidad = await this.periodoUnidadService.detectarYAsignarUnidad(nombrePeriodo);
      return { 
        nombrePeriodo, 
        unidadAsignada: unidad,
        mensaje: `El período "${nombrePeriodo}" sería mapeado a la unidad "${unidad}"`
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
