import { Controller, Post, Get, Query, Body, Res, UseGuards, Logger } from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/enums/user-role.enum';
import type { GradeReportData } from './interfaces/grade-report.interface';
import { PdfService } from './pdf.service';

@Controller('pdf')
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @Post('generate-grade-report')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.DOCENTE)
  async generateGradeReport(
    @Body() body: { estudianteId: string; periodoId: string },
    @Res() res: Response
  ) {
    const logger = new Logger('PdfController');
    
    try {
      logger.log(`Generando reporte para estudiante ${body.estudianteId}, período ${body.periodoId}`);
      
      if (!body.estudianteId || !body.periodoId) {
        throw new Error('Se requieren el ID del estudiante y el ID del período');
      }
      
      // Obtener los datos del reporte
      const reportData = await this.pdfService.getGradeReportData(
        body.estudianteId,
        body.periodoId
      );
      
      // Generar el PDF con los datos obtenidos
      const pdfBuffer = await this.pdfService.generateGradeReport(reportData);
      
      if (!pdfBuffer || !(pdfBuffer instanceof Buffer)) {
        throw new Error('El buffer del PDF es inválido');
      }
      
      const fileName = `boletin-${reportData.estudiante.nombre}-${reportData.estudiante.apellido}.pdf`.replace(/\s+/g, '_');
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': pdfBuffer.length,
      });
      
      res.send(pdfBuffer);
    } catch (error) {
      const errorMessage = error.message || 'Error desconocido al generar el PDF';
      logger.error('Error en generateGradeReport:', errorMessage);
      logger.error(error.stack);
      
      // Si la respuesta ya fue enviada, no podemos enviar otra respuesta
      if (res.headersSent) {
        return;
      }
      
      // Si es un error de validación, devolver 400 en lugar de 500
      const statusCode = error.name === 'ValidationError' ? 400 : 500;
      
      res.status(statusCode).json({
        success: false,
        message: 'Error al generar el PDF',
        error: process.env.NODE_ENV === 'development' ? errorMessage : 'Error interno del servidor',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
      });
    }
  }

  @Get('view-grade-report')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.DOCENTE, UserRole.ESTUDIANTE)
  async viewGradeReport(
    @Query('estudianteId') estudianteId: string,
    @Query('periodoId') periodoId: string,
    @Res() res: Response
  ) {
    try {
      // Aquí necesitarías obtener los datos del estudiante y período
      // Esto es un ejemplo - ajusta según tu lógica de negocio
      const data: GradeReportData = await this.pdfService.getGradeReportData(estudianteId, periodoId);
      
      const pdfBuffer = await this.pdfService.generateGradeReport(data);
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename=boletin-${data.estudiante.nombre}-${data.estudiante.apellido}.pdf`,
        'Content-Length': pdfBuffer.length,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      
      res.send(pdfBuffer);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al generar la vista previa del PDF',
        error: error.message,
      });
    }
  }

  @Post('generate-multiple-reports')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  async generateMultipleReports(
    @Body() data: GradeReportData[],
    @Res() res: Response
  ) {
    try {
      const pdfBuffer = await this.pdfService.generateMultipleReports(data);
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=boletines-grado.pdf',
        'Content-Length': pdfBuffer.length,
      });
      
      res.send(pdfBuffer);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al generar los PDFs',
        error: error.message,
      });
    }
  }
}
