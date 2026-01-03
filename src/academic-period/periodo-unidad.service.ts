import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PeriodoUnidadService {
  private readonly logger = new Logger(PeriodoUnidadService.name);

  // Patrones de mapeo (ordenados por prioridad)
  private readonly PATRONES_UNIDADES = [
    // PATRONES PARA FORMATO AÑO-NÚMERO (prioridad alta)
    { patron: /^(\d{4})[-._]?1$/, unidad: 'u1' },  // 2026-1, 2026_1, 2026.1
    { patron: /^(\d{4})[-._]?2$/, unidad: 'u2' },  // 2026-2, 2026_2, 2026.2
    { patron: /^(\d{4})[-._]?3$/, unidad: 'u3' },  // 2026-3, 2026_3, 2026.3
    { patron: /^(\d{4})[-._]?4$/, unidad: 'u4' },  // 2026-4, 2026_4, 2026.4
    
    // PATRONES PARA AÑO CON BIMESTRE
    { patron: /^(\d{4})[-._]?(bim|bimestre)[-. _]?1$/i, unidad: 'u1' },
    { patron: /^(\d{4})[-._]?(bim|bimestre)[-. _]?2$/i, unidad: 'u2' },
    { patron: /^(\d{4})[-._]?(bim|bimestre)[-. _]?3$/i, unidad: 'u3' },
    { patron: /^(\d{4})[-._]?(bim|bimestre)[-. _]?4$/i, unidad: 'u4' },
    
    // PATRONES PARA TRIMESTRES
    { patron: /^(\d{4})[-._]?(trim|trimestre)[-. _]?1$/i, unidad: 'u1' },
    { patron: /^(\d{4})[-._]?(trim|trimestre)[-. _]?2$/i, unidad: 'u2' },
    { patron: /^(\d{4})[-._]?(trim|trimestre)[-. _]?3$/i, unidad: 'u3' },
    
    // PATRONES PARA CUATRIMESTRES
    { patron: /^(\d{4})[-._]?(cuat|cuatrimestre)[-. _]?1$/i, unidad: 'u1' },
    { patron: /^(\d{4})[-._]?(cuat|cuatrimestre)[-. _]?2$/i, unidad: 'u3' }, // Mapear 2do cuatrimestre a u3
    
    // PATRONES PARA SEMESTRES
    { patron: /^(\d{4})[-._]?(sem|semestre)[-. _]?1$/i, unidad: 'u2' }, // 1er semestre = u2 (mitad)
    { patron: /^(\d{4})[-._]?(sem|semestre)[-. _]?2$/i, unidad: 'u4' }, // 2do semestre = u4 (final)
    
    // PATRONES ORIGINALES (si los anteriores no coinciden)
    { patron: /^(primer|1°|primero|bimestre.*1|u1|unidad.*1)/i, unidad: 'u1' },
    { patron: /^(segundo|2°|segundo|bimestre.*2|u2|unidad.*2)/i, unidad: 'u2' },
    { patron: /^(tercer|3°|tercero|bimestre.*3|u3|unidad.*3)/i, unidad: 'u3' },
    { patron: /^(cuarto|4°|cuarto|bimestre.*4|u4|unidad.*4)/i, unidad: 'u4' },
    
    // Patrones numéricos genéricos
    { patron: /\b1\b|\bfirst\b|\bq1\b/i, unidad: 'u1' },
    { patron: /\b2\b|\bsecond\b|\bq2\b/i, unidad: 'u2' },
    { patron: /\b3\b|\bthird\b|\bq3\b/i, unidad: 'u3' },
    { patron: /\b4\b|\bfourth\b|\bq4\b/i, unidad: 'u4' },
    
    // Patrones de secuencia
    { patron: /inicio|comienzo|start|beginning/i, unidad: 'u1' },
    { patron: /final|fin|end|conclusion/i, unidad: 'u4' },
  ];

  constructor(private prisma: PrismaService) {}

  async detectarYAsignarUnidad(nombrePeriodo: string): Promise<string> {
    this.logger.log(`Analizando período: "${nombrePeriodo}"`);
    
    const nombreLower = nombrePeriodo.toLowerCase().trim();
    
    // Buscar patrón coincidente
    for (const { patron, unidad } of this.PATRONES_UNIDADES) {
      if (patron.test(nombreLower)) {
        this.logger.log(`✅ Período "${nombrePeriodo}" mapeado a unidad: ${unidad}`);
        return unidad;
      }
    }

    // Si no hay coincidencia, asignar automáticamente por disponibilidad
    const unidadDisponible = await this.asignarUnidadDisponible();
    this.logger.log(`⚠️ Período "${nombrePeriodo}" sin patrón, asignando automáticamente: ${unidadDisponible}`);
    
    return unidadDisponible;
  }

  private async asignarUnidadDisponible(): Promise<string> {
    const unidades = ['u1', 'u2', 'u3', 'u4'];
    
    // Verificar cuáles unidades ya están asignadas
    const periodosExistentes = await this.prisma.periodoAcademico.findMany({
      where: { unidadAsignada: { not: null } },
      select: { unidadAsignada: true }
    });

    const unidadesUsadas = new Set(
      periodosExistentes.map(p => p.unidadAsignada).filter(Boolean)
    );

    // Devolver primera unidad disponible
    for (const unidad of unidades) {
      if (!unidadesUsadas.has(unidad)) {
        return unidad;
      }
    }

    // Si todas están usadas, devolver u1 por defecto
    return 'u1';
  }

  async getUnidadPorPeriodo(periodoId: string): Promise<string> {
    const periodo = await this.prisma.periodoAcademico.findUnique({
      where: { id: periodoId },
      select: { unidadAsignada: true, name: true }
    });

    if (!periodo) {
      throw new NotFoundException('Período no encontrado');
    }

    // Si ya tiene unidad asignada, devolverla
    if (periodo.unidadAsignada) {
      return periodo.unidadAsignada;
    }

    // Si no tiene unidad, detectarla y asignarla
    const unidad = await this.detectarYAsignarUnidad(periodo.name);
    
    // Guardar la unidad detectada
    await this.prisma.periodoAcademico.update({
      where: { id: periodoId },
      data: { unidadAsignada: unidad }
    });

    return unidad;
  }

  async reasignarUnidadPeriodo(periodoId: string, unidad: string) {
    // Validar que la unidad sea válida
    if (!['u1', 'u2', 'u3', 'u4'].includes(unidad)) {
      throw new Error('Unidad no válida. Debe ser u1, u2, u3 o u4');
    }

    return this.prisma.periodoAcademico.update({
      where: { id: periodoId },
      data: { unidadAsignada: unidad }
    });
  }

  async getUnidadesDisponibles(): Promise<string[]> {
    const unidades = ['u1', 'u2', 'u3', 'u4'];
    
    // Verificar cuáles unidades ya están asignadas
    const periodosExistentes = await this.prisma.periodoAcademico.findMany({
      where: { unidadAsignada: { not: null } },
      select: { unidadAsignada: true }
    });

    const unidadesUsadas = new Set(
      periodosExistentes.map(p => p.unidadAsignada).filter(Boolean)
    );

    // Devolver unidades no usadas
    return unidades.filter(unidad => !unidadesUsadas.has(unidad));
  }

  async getTodosLosPeriodosConUnidades() {
    return this.prisma.periodoAcademico.findMany({
      select: {
        id: true,
        name: true,
        unidadAsignada: true,
        isCurrent: true,
        startDate: true,
        endDate: true
      },
      orderBy: { startDate: 'desc' }
    });
  }
}
