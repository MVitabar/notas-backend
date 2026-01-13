import { Controller, Get, Post, Body, Param, Delete, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { MateriasService } from './materias.service';
import { CreateMateriaDto } from './dto/create-materia.dto';
import { AsignarMateriaDto } from './dto/asignar-materia.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/enums/user-role.enum';

@Controller('materias')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MateriasController {
  constructor(private readonly materiasService: MateriasService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.DOCENTE)
  async create(@Body() createMateriaDto: CreateMateriaDto, @Req() req) {
    // Si es un docente, forzar que la materia sea de tipo extracurricular
    if (req.user.rol === UserRole.DOCENTE) {
      // No es necesario verificar el tipo, siempre lo forzamos a extracurricular
      const tipoExtracurricular = await this.materiasService.findOrCreateTipoExtracurricular();
      createMateriaDto.tipoMateriaId = tipoExtracurricular.id;
    }
    return this.materiasService.create(createMateriaDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.DOCENTE, UserRole.ESTUDIANTE)
  findAll() {
    return this.materiasService.findAll();
  }

  @Get('tipos')
  @Roles(UserRole.ADMIN, UserRole.DOCENTE, UserRole.ESTUDIANTE)
  findAllTiposMateria() {
    return this.materiasService.findAllTiposMateria();
  }

  @Get('docente/mis-materias')
  @Roles(UserRole.DOCENTE, UserRole.ADMIN)
  getMisMaterias(@Req() req) {
    // Si es admin, devolver todas las materias activas
    if (req.user.rol === UserRole.ADMIN) {
      return this.materiasService.findAll();
    }
    // Si es docente, devolver solo sus materias asignadas
    return this.materiasService.getMateriasByDocente(req.user.userId);
  }

  @Post('docente/asignar')
  @Roles(UserRole.ADMIN)
  asignarMateriaADocente(
    @Body() asignarMateriaDto: AsignarMateriaDto,
    @Req() req,
  ) {
    return this.materiasService.asignarMateria(
      asignarMateriaDto.docenteId,
      asignarMateriaDto,
    );
  }

  @Delete('docente/desasignar/:asignacionId')
  @Roles(UserRole.ADMIN, UserRole.DOCENTE)
  removeAsignacion(
    @Param('asignacionId') asignacionId: string,
    @Req() req,
  ) {
    return this.materiasService.removeAsignacion(
      req.user.userId,
      asignacionId,
    );
  }
}
