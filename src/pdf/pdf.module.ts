import { Module, forwardRef } from '@nestjs/common';
import { PdfService } from './pdf.service';
import { PdfController } from './pdf.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CalificacionesModule } from '../calificaciones/calificaciones.module';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => CalificacionesModule)
  ],
  controllers: [PdfController],
  providers: [PdfService],
  exports: [PdfService],
})
export class PdfModule {}
