import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { PasswordChangeGuard } from './auth/guards/password-change.guard';
import { StudentsModule } from './students/students.module';
import { AcademicPeriodModule } from './academic-period/academic-period.module';
import { CalificacionesModule } from './calificaciones/calificaciones.module';
import { PdfModule } from './pdf/pdf.module';

@Module({
  imports: [
    AuthModule, 
    PrismaModule,
    StudentsModule,
    AcademicPeriodModule,
    CalificacionesModule,
    PdfModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PasswordChangeGuard,
    },
  ],
})
export class AppModule {}
