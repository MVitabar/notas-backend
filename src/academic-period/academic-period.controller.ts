import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { AcademicPeriodService } from './academic-period.service';
import { CreateAcademicPeriodDto } from './dto/create-academic-period.dto';
import { UpdateAcademicPeriodDto } from './dto/update-academic-period.dto';

@Controller('academic-periods')
export class AcademicPeriodController {
  constructor(private readonly academicPeriodService: AcademicPeriodService) {}

  @Post()
  create(@Body() createAcademicPeriodDto: CreateAcademicPeriodDto) {
    return this.academicPeriodService.create(createAcademicPeriodDto);
  }

  @Get()
  findAll() {
    return this.academicPeriodService.findAll();
  }

  @Get('current')
  findCurrent() {
    return this.academicPeriodService.findCurrent();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.academicPeriodService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateAcademicPeriodDto: UpdateAcademicPeriodDto,
  ) {
    return this.academicPeriodService.update(id, updateAcademicPeriodDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.academicPeriodService.remove(id);
  }
}
