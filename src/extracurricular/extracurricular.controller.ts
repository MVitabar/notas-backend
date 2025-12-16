import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Put, 
  Delete, 
  UseGuards, 
  Query,
  ParseUUIDPipe,
  BadRequestException
} from '@nestjs/common';
import { ExtracurricularService } from './extracurricular.service';
import { CreateExtracurricularDto } from './dto/create-extracurricular.dto';
import { UpdateExtracurricularDto } from './dto/update-extracurricular.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('extracurricular')
@ApiBearerAuth()
@Controller('extracurricular')
@UseGuards(JwtAuthGuard)
@Roles(UserRole.ADMIN, UserRole.DOCENTE)
export class ExtracurricularController {
  constructor(private readonly extracurricularService: ExtracurricularService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva actividad extracurricular' })
  @ApiResponse({ status: 201, description: 'Actividad creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'No tiene permisos' })
  create(@Body() createExtracurricularDto: CreateExtracurricularDto) {
    return this.extracurricularService.create(createExtracurricularDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las actividades extracurriculares' })
  @ApiResponse({ status: 200, description: 'Lista de actividades' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'No tiene permisos' })
  findAll(@Query('activa') activa?: string) {
    const filter: { activa?: boolean } = {};
    
    if (activa !== undefined) {
      if (activa.toLowerCase() === 'true') {
        filter.activa = true;
      } else if (activa.toLowerCase() === 'false') {
        filter.activa = false;
      } else {
        throw new BadRequestException('El parámetro activa debe ser true o false');
      }
    }
    
    return this.extracurricularService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una actividad extracurricular por ID' })
  @ApiResponse({ status: 200, description: 'Actividad encontrada' })
  @ApiResponse({ status: 404, description: 'Actividad no encontrada' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'No tiene permisos' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.extracurricularService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar una actividad extracurricular' })
  @ApiResponse({ status: 200, description: 'Actividad actualizada' })
  @ApiResponse({ status: 404, description: 'Actividad no encontrada' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'No tiene permisos' })
  update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateExtracurricularDto: UpdateExtracurricularDto
  ) {
    return this.extracurricularService.update(id, updateExtracurricularDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una actividad extracurricular' })
  @ApiResponse({ status: 200, description: 'Actividad eliminada o desactivada' })
  @ApiResponse({ status: 404, description: 'Actividad no encontrada' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'No tiene permisos' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.extracurricularService.remove(id);
  }
}
