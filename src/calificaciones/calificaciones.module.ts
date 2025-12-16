import { Module, forwardRef } from '@nestjs/common';
import { CalificacionesService } from './calificaciones.service';
import { CalificacionesController } from './calificaciones.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MateriasModule } from '../materias/materias.module';
import { AcademicPeriodModule } from '../academic-period/academic-period.module';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => MateriasModule),
    AcademicPeriodModule
  ],
  controllers: [CalificacionesController],
  providers: [CalificacionesService],
  exports: [CalificacionesService]
})
export class CalificacionesModule {}
