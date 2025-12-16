import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MateriasService } from './materias.service';
import { MateriasController } from './materias.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CalificacionesModule } from '../calificaciones/calificaciones.module';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => CalificacionesModule),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [MateriasController],
  providers: [
    MateriasService,
    RolesGuard,
  ],
  exports: [MateriasService]
})
export class MateriasModule {}
