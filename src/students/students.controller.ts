import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query, BadRequestException } from '@nestjs/common';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/enums/user-role.enum';

@Controller('students')
@UseGuards(JwtAuthGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentsService.create(createStudentDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.DOCENTE)
  findAll(
    @Query('grado') grado?: string,
    @Query('nivel') nivel?: string,
    @Query('seccion') seccion?: string
  ) {
    return this.studentsService.findByGrado(grado, nivel, seccion);
  }

  @Get('por-grado')
  @Roles(UserRole.ADMIN, UserRole.DOCENTE)
  getByGrade(
    @Query('grado') grado: string,
    @Query('nivel') nivel?: string,
    @Query('seccion') seccion?: string
  ) {
    if (!grado) {
      throw new BadRequestException('El parámetro "grado" es requerido');
    }
    return this.studentsService.findByGrado(grado, nivel, seccion);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCENTE)
  findOne(@Param('id') id: string) {
    return this.studentsService.findOne(id);
  }

  @Get(':id/calificaciones')
  @Roles(UserRole.ADMIN, UserRole.DOCENTE)
  async findStudentWithGrades(@Param('id') id: string) {
    return this.studentsService.findOneWithGrades(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto) {
    return this.studentsService.update(id, updateStudentDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.studentsService.remove(id);
  }
}
