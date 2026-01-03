import { Module } from '@nestjs/common';
import { AcademicPeriodService } from './academic-period.service';
import { AcademicPeriodController } from './academic-period.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PeriodoUnidadService } from './periodo-unidad.service';
import { PeriodoUnidadController } from './periodo-unidad.controller';

@Module({
  imports: [PrismaModule],
  controllers: [AcademicPeriodController, PeriodoUnidadController],
  providers: [AcademicPeriodService, PeriodoUnidadService],
  exports: [AcademicPeriodService, PeriodoUnidadService],
})
export class AcademicPeriodModule {}
