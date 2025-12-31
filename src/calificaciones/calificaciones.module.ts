import { Module, forwardRef } from '@nestjs/common';
import { CalificacionesService } from './calificaciones.service';
import { CalificacionesController } from './calificaciones.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MateriasModule } from '../materias/materias.module';
import { AcademicPeriodModule } from '../academic-period/academic-period.module';
import { CalificacionHabitoService } from './calificacion-habito.service';
import { CalificacionHabitoController } from './calificacion-habito.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => MateriasModule),
    AcademicPeriodModule,
    forwardRef(() => AuthModule)
  ],
  controllers: [
    CalificacionesController, 
    CalificacionHabitoController
  ],
  providers: [
    CalificacionesService, 
    CalificacionHabitoService
  ],
  exports: [
    CalificacionesService,
    CalificacionHabitoService
  ]
})
export class CalificacionesModule {}
