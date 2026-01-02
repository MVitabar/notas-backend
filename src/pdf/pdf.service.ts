import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as fontkit from 'fontkit';
import * as fs from 'fs';
import * as path from 'path';
import { GradeReportData, Student, Materia, EvaluacionExtracurricular, Habito } from './interfaces/grade-report.interface';
import { PrismaService } from '../prisma/prisma.service';
import { CalificacionesService } from '../calificaciones/calificaciones.service';

// Enum para los tipos de evaluación
export enum EvaluacionTipo {
  EXTRACURRICULAR = 'EXTRACURRICULAR',
  COMPORTAMIENTO = 'COMPORTAMIENTO',
  APRENDIZAJE = 'APRENDIZAJE',
  CASA = 'CASA'
}

// Mapeo de tipos a títulos para mostrar en el PDF
const TIPOS_EVALUACION = [
  { 
    key: 'extracurriculares_valorativas', 
    titulo: 'Actividades Extracurriculares',
    tipo: EvaluacionTipo.EXTRACURRICULAR
  },
  { 
    key: 'responsabilidad_comportamiento', 
    titulo: 'Responsabilidad de Comportamiento',
    tipo: EvaluacionTipo.COMPORTAMIENTO
  },
  { 
    key: 'responsabilidad_aprendizaje', 
    titulo: 'Responsabilidad de Aprendizaje',
    tipo: EvaluacionTipo.APRENDIZAJE
  },
  { 
    key: 'habitos_casa', 
    titulo: 'Hábitos en Casa',
    tipo: EvaluacionTipo.CASA
  }
];

// Mapeo de nombres de evaluación a tipos (para compatibilidad con datos antiguos)
const MAPA_NOMBRE_A_TIPO: Record<string, EvaluacionTipo> = {
  // Extracurriculares
  'Lógica Matemática': EvaluacionTipo.EXTRACURRICULAR,
  'Comprensión de Lectura': EvaluacionTipo.EXTRACURRICULAR,
  
  // Comportamiento
  'Respeta autoridad': EvaluacionTipo.COMPORTAMIENTO,
  'Interactúa bien con sus compañeros': EvaluacionTipo.COMPORTAMIENTO,
  'Acepta responsabilidad': EvaluacionTipo.COMPORTAMIENTO,
  'Practica valores morales': EvaluacionTipo.COMPORTAMIENTO,
  
  // Aprendizaje
  'Completa trabajo a tiempo': EvaluacionTipo.APRENDIZAJE,
  'Regresa tareas firmadas': EvaluacionTipo.APRENDIZAJE,
  'Participa en actividades': EvaluacionTipo.APRENDIZAJE,
  
  // Casa
  'Viene preparado': EvaluacionTipo.CASA,
  'Termina tareas': EvaluacionTipo.CASA,
  'Lee diariamente': EvaluacionTipo.CASA,
  'Asiste a juntas': EvaluacionTipo.CASA,
  'Practica matemáticas': EvaluacionTipo.CASA,
  'Practica vocabulario de inglés': EvaluacionTipo.CASA
};

@Injectable()
export class PdfService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => CalificacionesService))
    private calificacionesService: CalificacionesService
  ) {}

  private readonly logger = new Logger(PdfService.name);
  private readonly assetsPath = path.join(process.cwd(), 'assets');
  private readonly fontsPath = path.join(process.cwd(), 'fonts');

  async generateGradeReport(data: GradeReportData): Promise<Buffer> {
    this.logger.log('Iniciando generación de reporte PDF');
    
    try {
      // Validar datos de entrada
      if (!data.estudiante) {
        throw new Error('Datos del estudiante no proporcionados');
      }
      
      this.logger.log(`Procesando estudiante: ${data.estudiante.nombre} ${data.estudiante.apellido}`);
      
      // Crear documento PDF
      const pdfDoc = await PDFDocument.create();
      pdfDoc.registerFontkit(fontkit);

      try {
        // Cargar fuentes
        const fontPath = path.join(this.fontsPath, 'arial.ttf');
        if (!fs.existsSync(fontPath)) {
          throw new Error(`No se encontró el archivo de fuente en: ${fontPath}`);
        }
        
        const fontBytes = fs.readFileSync(fontPath);
        const font = await pdfDoc.embedFont(fontBytes);
        const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        // Crear página
        const page = pdfDoc.addPage([595.28, 841.89]); // A4 en puntos

        // Dibujar contenido
        this.logger.log('Dibujando encabezado...');
        await this.drawHeader(page, pdfDoc);
        
        this.logger.log('Dibujando información del estudiante...');
        this.drawStudentInfo(page, data.estudiante, font, boldFont);
        
        this.logger.log('Dibujando áreas académicas...');
        this.drawAcademicAreas(page, data, font, boldFont);
        
        this.logger.log('Dibujando actividades extracurriculares...');
        this.drawExtracurricularActivities(page, data, font);
        
        this.logger.log('Dibujando secciones de hábitos...');
        this.drawHabitsSections(page, data, font);
        
        this.logger.log('Dibujando pie de página...');
        this.drawFooter(page, pdfDoc);

        // Guardar PDF
        this.logger.log('Guardando PDF...');
        const pdfBytes = await pdfDoc.save();
        
        if (!pdfBytes || !(pdfBytes instanceof Uint8Array)) {
          throw new Error('Error al generar el buffer del PDF');
        }
        
        this.logger.log('PDF generado exitosamente');
        return Buffer.from(pdfBytes);
        
      } catch (innerError) {
        this.logger.error('Error al generar el PDF (inner):', innerError);
        throw new Error(`Error al generar el PDF: ${innerError.message}`);
      }
      
    } catch (error) {
      this.logger.error('Error en generateGradeReport:', error);
      throw new Error(`Error al generar el documento del estudiante: ${error.message}`);
    }
  }

  private async drawHeader(page: any, pdfDoc: any) {
    try {
      const headerPath = path.join(this.assetsPath, 'header.png');
      if (fs.existsSync(headerPath)) {
        const headerImage = await pdfDoc.embedPng(fs.readFileSync(headerPath));
        page.drawImage(headerImage, {
          x: 0,
          y: page.getHeight() - 100,
          width: page.getWidth(),
          height: 80,
        });
      }
    } catch (error) {
      this.logger.warn('No se pudo cargar la imagen de encabezado');
    }
  }

  private drawStudentInfo(page: any, student: any, font: any, boldFont: any) {
    // Título
    page.drawText('BOLETÍN DE CALIFICACIONES', {
      x: 50,
      y: page.getHeight() - 120,
      size: 16,
      font: boldFont,
      color: rgb(0, 0.34, 0.7),
    });

    // Información del estudiante
    const studentInfo = [
      `Nombre: ${student.nombre} ${student.apellido}`,
      `Grado: ${student.grado}`,
      `Sección: ${student.seccion}`,
      `Año: ${student.anio}`
    ];

    studentInfo.forEach((text, index) => {
      page.drawText(text, {
        x: 50,
        y: page.getHeight() - 160 - (index * 20),
        size: 12,
        font: font,
      });
    });
  }

  private drawAcademicAreas(page: any, data: GradeReportData, font: any, boldFont: any) {
    const startY = page.getHeight() - 220;
    const colWidths = [200, 80, 80, 80, 80, 80];
    const headers = ['Área Académica', 'I UNIDAD', 'II UNIDAD', 'III UNIDAD', 'IV UNIDAD', 'NOTA FINAL'];

    // Encabezados
    headers.forEach((header, i) => {
      page.drawText(header, {
        x: 50 + colWidths.slice(0, i).reduce((a, b) => a + b, 0),
        y: startY,
        size: 10,
        font: boldFont,
      });
    });

    // Filas de materias
    data.materias.forEach((materia, rowIndex) => {
      const y = startY - ((rowIndex + 1) * 20);
      
      // Fondo alternado
      if (rowIndex % 2 === 0) {
        page.drawRectangle({
          x: 50,
          y: y - 15,
          width: colWidths.reduce((a, b) => a + b, 0),
          height: 20,
          color: rgb(0.95, 0.95, 0.95),
        });
      }

      // Contenido de celdas
      [
        materia.nombre_materia,
        materia.u1?.toString() || '-',
        materia.u2?.toString() || '-',
        materia.u3?.toString() || '-',
        materia.u4?.toString() || '-',
        materia.final?.toString() || '-'
      ].forEach((text, colIndex) => {
        page.drawText(text, {
          x: 55 + colWidths.slice(0, colIndex).reduce((a, b) => a + b, 0),
          y: y,
          size: 10,
          font: font,
        });
      });
    });

    // Promedios
    const promedioY = startY - ((data.materias.length + 1) * 20);
    page.drawText('Promedio por unidad', {
      x: 50,
      y: promedioY,
      size: 10,
      font: boldFont,
    });

    ['u1', 'u2', 'u3', 'u4'].forEach((u, i) => {
      page.drawText(data.promedios[u]?.toFixed(2) || '-', {
        x: 330 + (i * 80),
        y: promedioY,
        size: 10,
        font: boldFont,
      });
    });
  }

  private drawExtracurricularActivities(page: any, data: GradeReportData, font: any) {
    if (!data.extracurriculares_valorativas?.length) return;

    const startY = 400; // Ajustar según sea necesario
    const colWidths = [200, 80, 80, 80, 80, 200];
    const headers = ['Actividad Extracurricular', 'I UNIDAD', 'II UNIDAD', 'III UNIDAD', 'IV UNIDAD', 'COMENTARIO'];

    // Título de la sección
    page.drawText('Evaluaciones Extracurriculares', {
      x: 50,
      y: startY + 30,
      size: 12,
      font: font,
    });

    // Encabezados
    headers.forEach((header, i) => {
      page.drawText(header, {
        x: 50 + colWidths.slice(0, i).reduce((a, b) => a + b, 0),
        y: startY,
        size: 9,
        font: font,
      });
    });

    // Filas
    data.extracurriculares_valorativas.forEach((item, rowIndex) => {
      const y = startY - ((rowIndex + 1) * 20);
      
      // Fondo alternado
      if (rowIndex % 2 === 0) {
        page.drawRectangle({
          x: 50,
          y: y - 15,
          width: colWidths.reduce((a, b) => a + b, 0),
          height: 20,
          color: rgb(0.98, 0.98, 0.98),
        });
      }

      // Contenido
      [item.nombre, item.u1, item.u2, item.u3, item.u4, item.comentario || ''].forEach((text, colIndex) => {
        page.drawText(text?.toString() || '-', {
          x: 55 + colWidths.slice(0, colIndex).reduce((a, b) => a + b, 0),
          y: y,
          size: 8,
          font: font,
          maxWidth: colWidths[colIndex] - 10,
        });
      });
    });
  }

  private drawHabitsSections(page: any, data: GradeReportData, font: any) {
    const sections = [
      { title: 'Responsabilidad del Estudiante con su Aprendizaje', data: data.responsabilidad_aprendizaje },
      { title: 'Responsabilidades del Estudiante con su Comportamiento', data: data.responsabilidad_comportamiento },
      { title: 'Hábitos Practicados en Casa', data: data.habitos_casa }
    ];

    let currentY = 300; // Ajustar según sea necesario

    sections.forEach(section => {
      if (!section.data?.length) return;

      // Título de la sección
      page.drawText(section.title, {
        x: 50,
        y: currentY,
        size: 10,
        font: font,
      });

      // Tabla de hábitos
      const colWidths = [300, 60, 60, 60, 60];
      const headers = ['Descriptor', 'I UNI', 'II UNI', 'III UNI', 'IV UNI'];

      // Encabezados
      headers.forEach((header, i) => {
        page.drawText(header, {
          x: 50 + colWidths.slice(0, i).reduce((a, b) => a + b, 0),
          y: currentY - 20,
          size: 8,
          font: font,
        });
      });

      // Filas
      section.data.forEach((item, rowIndex) => {
        const y = currentY - 40 - (rowIndex * 20);
        
        // Contenido
        [item.nombre, item.u1, item.u2, item.u3, item.u4].forEach((text, colIndex) => {
          page.drawText(text?.toString() || '-', {
            x: 55 + colWidths.slice(0, colIndex).reduce((a, b) => a + b, 0),
            y: y,
            size: 8,
            font: font,
            maxWidth: colWidths[colIndex] - 10,
          });
        });
      });

      currentY -= (section.data.length * 25) + 40; // Ajustar espaciado
    });
  }

  private async drawFooter(page: any, pdfDoc: any) {
    try {
      const footerPath = path.join(this.assetsPath, 'footer.png');
      if (fs.existsSync(footerPath)) {
        const footerImage = await pdfDoc.embedPng(fs.readFileSync(footerPath));
        page.drawImage(footerImage, {
          x: 0,
          y: 20,
          width: page.getWidth(),
          height: 60,
        });
      }
    } catch (error) {
      this.logger.warn('No se pudo cargar la imagen de pie de página');
    }

    // Texto del pie de página
    page.drawText('Sistema de Gestión Académica', {
      x: 50,
      y: 30,
      size: 10,
      color: rgb(0.4, 0.4, 0.4),
    });
  }

  /**
   * Categoriza las evaluaciones por tipo para mostrarlas en secciones separadas en el PDF
   * @param data Datos del reporte con evaluaciones sin categorizar
   * @returns Datos del reporte con evaluaciones categorizadas
   */
  private categorizeData(data: GradeReportData): GradeReportData {
    // Inicializar el objeto de resultados con arrays vacíos
    const result: Record<string, any[]> = {};
    TIPOS_EVALUACION.forEach(({ key }) => {
      result[key] = [];
    });

    // Procesar cada evaluación
    data.extracurriculares_valorativas.forEach((item: any) => {
      let tipo = item.tipo;
      
      // Si no tiene tipo definido, intentar determinarlo por el nombre
      if (!tipo && item.nombre) {
        tipo = MAPA_NOMBRE_A_TIPO[item.nombre];
      }
      
      // Si aún no se pudo determinar el tipo, usar APRENDIZAJE como predeterminado
      if (!tipo) {
        tipo = EvaluacionTipo.APRENDIZAJE;
      }
      
      // Buscar la categoría correspondiente
      const categoria = TIPOS_EVALUACION.find(t => t.tipo === tipo);
      if (categoria) {
        result[categoria.key].push({
          ...item,
          tipo: tipo // Asegurarse de que el tipo esté definido
        });
      }
    });

    // Retornar el resultado con la misma estructura esperada
    return {
      ...data,
      ...result,
      // Mantener la lista completa de evaluaciones para referencia
      todas_las_evaluaciones: data.extracurriculares_valorativas
    };
  }

  /**
   * Genera múltiples reportes en un solo PDF
   * @param reports Array de datos para los reportes
   * @returns Buffer con el PDF generado
   */
  async generateMultipleReports(reports: GradeReportData[]): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    try {
      for (const [index, report] of reports.entries()) {
        try {
          const studentPdf = await this.generateGradeReport(report);
          const studentDoc = await PDFDocument.load(studentPdf);
          
          const pages = await pdfDoc.copyPages(studentDoc, studentDoc.getPageIndices());
          pages.forEach(page => pdfDoc.addPage(page));
          
          // Agregar página en blanco entre estudiantes (excepto después del último)
          if (index < reports.length - 1) {
            pdfDoc.addPage();
          }
        } catch (error) {
          this.logger.error(`Error generando reporte para ${report.estudiante.nombre}:`, error);
          // Continuar con el siguiente reporte
          continue;
        }
      }

      // Si no se pudo generar ningún reporte, lanzar error
      if (pdfDoc.getPageCount() === 0) {
        throw new Error('No se pudo generar ningún reporte');
      }

      return Buffer.from(await pdfDoc.save());
    } catch (error) {
      this.logger.error('Error en generateMultipleReports:', error);
      throw new Error(`Error al generar reportes múltiples: ${error.message}`);
    }
  }

  /**
   * Convierte una calificación conceptual a su valor numérico
   * @param nota Nota en formato conceptual o numérico
   * @returns Valor numérico de la nota
   */
  private parsearNota(nota: string | number | null | undefined): number | null {
    if (nota === null || nota === undefined) return null;
    
    if (typeof nota === 'number') return nota;
    
    // Intentar convertir a número
    const valorNumerico = parseFloat(nota);
    if (!isNaN(valorNumerico)) return valorNumerico;
    
    // Si no es un número, intentar interpretar como concepto
    switch(nota.trim().toUpperCase()) {
      case 'DESTACA': return 5;
      case 'AVANZA': return 4;
      case 'NECESITA_MEJORAR':
      case 'NECESITA MEJORAR':
        return 3;
      case 'INSATISFACTORIO':
        return 2;
      default:
        return 0;
    }
  }

  /**
   * Calcula el promedio de calificaciones
   * @param calificaciones Objeto con calificaciones por unidad
   * @returns Promedio formateado como string con 2 decimales
   */
  private calcularPromedio(calificaciones: Record<string, any>): string {
    try {
      const valores = Object.values(calificaciones)
        .filter(v => v !== null && v !== undefined && v !== '-')
        .map(v => {
          if (typeof v === 'number') return v;
          if (typeof v === 'string') {
            const num = parseFloat(v);
            if (!isNaN(num)) return num;
            return this.parsearNota(v) || 0;
          }
          return 0;
        });

      if (valores.length === 0) return '0.00';
      
      const suma = valores.reduce((a, b) => a + b, 0);
      const promedio = suma / valores.length;
      
      return promedio.toFixed(2);
    } catch (error) {
      this.logger.error('Error en calcularPromedio:', error);
      return '0.00';
    }
  }

  /**
   * Calcula los promedios generales por unidad
   * @param materias Lista de materias con sus calificaciones
   * @returns Objeto con los promedios por unidad
   */
  private calcularPromedios(materias: Materia[]): { u1: number; u2: number; u3: number; u4: number } {
    const sumas = { u1: 0, u2: 0, u3: 0, u4: 0 };
    const contadores = { u1: 0, u2: 0, u3: 0, u4: 0 };

    materias.forEach(materia => {
      if (materia.u1 !== null && materia.u1 !== undefined) {
        sumas.u1 += this.parsearNota(materia.u1) || 0;
        contadores.u1++;
      }
      if (materia.u2 !== null && materia.u2 !== undefined) {
        sumas.u2 += this.parsearNota(materia.u2) || 0;
        contadores.u2++;
      }
      if (materia.u3 !== null && materia.u3 !== undefined) {
        sumas.u3 += this.parsearNota(materia.u3) || 0;
        contadores.u3++;
      }
      if (materia.u4 !== null && materia.u4 !== undefined) {
        sumas.u4 += this.parsearNota(materia.u4) || 0;
        contadores.u4++;
      }
    });

    return {
      u1: contadores.u1 > 0 ? parseFloat((sumas.u1 / contadores.u1).toFixed(2)) : 0,
      u2: contadores.u2 > 0 ? parseFloat((sumas.u2 / contadores.u2).toFixed(2)) : 0,
      u3: contadores.u3 > 0 ? parseFloat((sumas.u3 / contadores.u3).toFixed(2)) : 0,
      u4: contadores.u4 > 0 ? parseFloat((sumas.u4 / contadores.u4).toFixed(2)) : 0
    };
  }

  async getGradeReportData(estudianteId: string, periodoId: string): Promise<GradeReportData> {
    try {
      this.logger.log(`Obteniendo datos para el reporte del estudiante ${estudianteId}, período ${periodoId}`);
      
      // 1. Obtener datos del estudiante con sus calificaciones
      const estudiante = await this.prisma.student.findUnique({
        where: { id: estudianteId },
        include: {
          calificaciones: {
            where: { periodoId },
            include: {
              materia: true,
              periodo: true
            }
          }
        }
      });

      if (!estudiante) {
        throw new Error('Estudiante no encontrado');
      }

      // Obtener información del grado (asumiendo que está en el array de grados del estudiante)
      const gradoId = estudiante.grados?.[0];
      let gradoNombre = 'No asignado';
      let seccion = '';
      
      // Si hay un ID de grado, intentar obtener más información
      if (gradoId) {
        try {
          // Verificar si el modelo Grado existe en el esquema
          if ('grado' in this.prisma) {
            const grado = await (this.prisma as any).grado.findUnique({
              where: { id: gradoId },
              include: { nivel: true }
            });
            if (grado) {
              gradoNombre = grado.nombre || gradoNombre;
              if (grado.nivel) {
                gradoNombre += ` ${grado.nivel.nombre || ''}`.trim();
              }
              seccion = grado.seccion || '';
            }
          }
        } catch (error) {
          this.logger.warn('Error al obtener información del grado:', error);
          // Si no se puede obtener la información del grado, usar el ID como nombre
          gradoNombre = `Grado ${gradoId}`;
        }
      }

      if (!estudiante) {
        throw new Error('Estudiante no encontrado');
      }

      // 2. Obtener el período académico
      let periodo: { id: string; name: string; startDate: Date; endDate: Date } | null = null;
      try {
        const periodoData = await this.prisma.periodoAcademico.findUnique({
          where: { id: periodoId },
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true
          }
        });
        if (periodoData) {
          periodo = {
            id: periodoData.id,
            name: periodoData.name,
            startDate: periodoData.startDate,
            endDate: periodoData.endDate
          };
        }
      } catch (error) {
        this.logger.warn('No se pudo obtener información del período:', error);
      }

      // 3. Obtener calificaciones de hábitos
      let habitos: any[] = [];
      try {
        // Usar el servicio directamente si está disponible
        if ('obtenerCalificacionesPorEstudiante' in this.calificacionesService) {
          habitos = await (this.calificacionesService as any).obtenerCalificacionesPorEstudiante(
            estudianteId,
            periodoId
          );
        } else {
          // Si no está disponible el método, intentar obtener las calificaciones directamente
          habitos = await this.prisma.calificacionHabito.findMany({
            where: {
              estudianteId,
              periodoId
            },
            include: {
              evaluacionHabito: true
            }
          });
        }
      } catch (error) {
        this.logger.warn('Error al obtener calificaciones de hábitos:', error);
      }

      // 4. Procesar datos del estudiante
      const anioAcademico = periodo?.startDate 
        ? new Date(periodo.startDate).getFullYear().toString()
        : new Date().getFullYear().toString();
      
      const studentData: Student = {
        id: estudiante.id,
        nombre: estudiante.nombre || 'Sin nombre',
        apellido: estudiante.apellido || '',
        dni: estudiante.dni || '',
        grado: gradoNombre,
        seccion: seccion,
        anio: anioAcademico
      };

      // 5. Inicializar estructuras de datos
      const materias: Materia[] = [];
      const extracurricularesValorativas: EvaluacionExtracurricular[] = [];
      const responsabilidadAprendizaje: Habito[] = [];
      const responsabilidadComportamiento: Habito[] = [];
      const habitosCasa: Habito[] = [];
      
      // 6. Procesar calificaciones regulares
      const calificaciones = estudiante.calificaciones || [];
      if (calificaciones && calificaciones.length > 0) {
        // Agrupar calificaciones por materia
        const calificacionesPorMateria = new Map<string, any>();
        
        calificaciones.forEach(calif => {
          if (!calif.materia) return;
          
          const key = calif.materiaId;
          if (!calificacionesPorMateria.has(key)) {
            calificacionesPorMateria.set(key, {
              id: calif.materiaId,
              nombre: calif.materia.nombre || 'Sin nombre',
              tipoMateria: calif.materia.tipoMateriaId || 'Regular',
              u1: null,
              u2: null,
              u3: null,
              u4: null,
              final: null,
              comentario: calif.comentario || ''
            });
          }
          
          const materia = calificacionesPorMateria.get(key);
          if (calif.unidad) {
            const valor = calif.tipoCalificacion === 'NUMERICA' 
              ? calif.calificacion 
              : this.parsearNota(calif.valorConceptual);
              
            switch(calif.unidad) {
              case 'U1': materia.u1 = valor; break;
              case 'U2': materia.u2 = valor; break;
              case 'U3': materia.u3 = valor; break;
              case 'U4': materia.u4 = valor; break;
              case 'FINAL': materia.final = valor; break;
            }
          }
        });

        // Clasificar materias en regulares o extracurriculares
        for (const [_, materia] of calificacionesPorMateria) {
          if (materia.tipoMateriaId === 'EXTRACURRICULAR' || materia.nombre?.toLowerCase().includes('extra')) {
            extracurricularesValorativas.push({
              id: `extra-${materia.id}`,
              nombre: materia.nombre,
              u1: materia.u1,
              u2: materia.u2,
              u3: materia.u3,
              u4: materia.u4,
              comentario: materia.comentario
            });
          } else {
            materias.push({
              id: materia.id,
              nombre_materia: materia.nombre,
              // tipoMateria no está en la interfaz Materia, lo eliminamos
              u1: materia.u1,
              u2: materia.u2,
              u3: materia.u3,
              u4: materia.u4,
              final: materia.final || this.calcularPromedio({
                u1: materia.u1 || '0',
                u2: materia.u2 || '0',
                u3: materia.u3 || '0',
                u4: materia.u4 || '0'
              })
            });
          }
        }
      }

      // 7. Procesar hábitos
      if (Array.isArray(habitos)) {
        try {
          habitos.forEach(habito => {
            const habitoFormateado: Habito = {
              id: habito.id,
              nombre: habito.nombre || 'Hábito sin nombre',
              u1: habito.u1 ? this.parsearNota(habito.u1) : null,
              u2: habito.u2 ? this.parsearNota(habito.u2) : null,
              u3: habito.u3 ? this.parsearNota(habito.u3) : null,
              u4: habito.u4 ? this.parsearNota(habito.u4) : null,
              comentario: habito.comentario || null
            };

            // Clasificar el hábito según su tipo
            if (habito.tipo === 'RESPONSABILIDAD' || habito.tipo === 'APRENDIZAJE') {
              responsabilidadAprendizaje.push(habitoFormateado);
            } else if (habito.tipo === 'COMPORTAMIENTO') {
              responsabilidadComportamiento.push(habitoFormateado);
            } else if (habito.tipo === 'CASA') {
              habitosCasa.push(habitoFormateado);
            }
          });
        } catch (error) {
          this.logger.error('Error procesando hábitos:', error);
          throw new Error(`Error al obtener datos para el reporte: ${error.message}`);
        }
      } else {
        this.logger.error('Error: habitos no es un array');
        throw new Error('Error al obtener datos para el reporte');
      }

      // 8. Calcular promedios
      const promedios = this.calcularPromedios(materias);

      // 9. Retornar los datos estructurados
      return {
        estudiante: studentData,
        materias,
        extracurriculares_valorativas: extracurricularesValorativas,
        responsabilidad_aprendizaje: responsabilidadAprendizaje,
        responsabilidad_comportamiento: responsabilidadComportamiento,
        habitos_casa: habitosCasa,
        promedios
      };
    } catch (error) {
      this.logger.error('Error en getGradeReportData:', error);
      throw new Error(`Error al obtener datos para el reporte: ${error.message}`);
    }
  }
}
