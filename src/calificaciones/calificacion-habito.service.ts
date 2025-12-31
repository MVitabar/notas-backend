import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaExtendedService } from '../prisma/prisma-extended.service';
import { EvaluacionHabito, CalificacionHabito, Prisma } from '@prisma/client';
import { GrupoHabito, HabitoEstudiante, ResumenHabitos } from './types/habitos.types';

@Injectable()
export class CalificacionHabitoService {
  constructor(private prisma: PrismaExtendedService) {}

  async obtenerCalificacionesPorEstudiante(estudianteId: string, periodoId: string) {
    // Verificar si el estudiante existe
    const estudiante = await this.prisma.student.findUnique({
      where: { id: estudianteId }
    });

    if (!estudiante) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    // Obtener todas las materias extraescolares
    const materiasExtracurriculares = await this.prisma.$queryRaw<any[]>`
      SELECT id, nombre, descripcion, 'EXTRACURRICULAR' as tipo, orden
      FROM "Materia"
      WHERE "esExtraescolar" = true AND "activo" = true
      ORDER BY "orden" ASC, "nombre" ASC
    `;

    // Obtener todas las evaluaciones de hábitos
    const evaluacionesHabitos = await this.prisma.$queryRaw<EvaluacionHabito[]>`
      SELECT * FROM "EvaluacionHabito"
      WHERE "activo" = true
      ORDER BY "tipo" ASC, "orden" ASC
    `;

    // Obtener las calificaciones existentes
    const calificacionesExistentes = await this.prisma.$queryRaw<CalificacionHabito[]>`
      SELECT * FROM "CalificacionHabito"
      WHERE "estudianteId" = ${estudianteId} AND "periodoId" = ${periodoId}
    `;

    // Crear un mapa de calificaciones por evaluación
    const calificacionesMap = new Map(
      calificacionesExistentes.map(c => [c.evaluacionHabitoId, c])
    );

    // Combinar evaluaciones con sus calificaciones
    const resultado: HabitoEstudiante[] = [];
    
    // Procesar materias extracurriculares
    for (const materia of materiasExtracurriculares) {
      const calificacion = calificacionesExistentes.find(c => c.evaluacionHabitoId === materia.id);
      
      const habito: HabitoEstudiante = {
        id: calificacion?.id,
        evaluacionHabitoId: materia.id,
        nombre: materia.nombre,
        descripcion: materia.descripcion,
        tipo: 'EXTRACURRICULAR',
        u1: calificacion?.u1 || null,
        u2: calificacion?.u2 || null,
        u3: calificacion?.u3 || null,
        u4: calificacion?.u4 || null,
        comentario: calificacion?.comentario || null,
        createdAt: calificacion?.createdAt ? new Date(calificacion.createdAt) : null,
        updatedAt: calificacion?.updatedAt ? new Date(calificacion.updatedAt) : null,
        esMateria: true
      };
      
      resultado.push(habito);
    }
    
    // Procesar evaluaciones de hábitos
    for (const evaluacion of evaluacionesHabitos) {
      const calificacion = calificacionesMap.get(evaluacion.id);
      
      const habito: HabitoEstudiante = {
        id: calificacion?.id,
        evaluacionHabitoId: evaluacion.id,
        nombre: evaluacion.nombre,
        descripcion: evaluacion.descripcion,
        tipo: evaluacion.tipo,
        u1: calificacion?.u1 || null,
        u2: calificacion?.u2 || null,
        u3: calificacion?.u3 || null,
        u4: calificacion?.u4 || null,
        comentario: calificacion?.comentario || null,
        createdAt: calificacion?.createdAt ? new Date(calificacion.createdAt) : null,
        updatedAt: calificacion?.updatedAt ? new Date(calificacion.updatedAt) : null,
        esMateria: false
      };
      
      resultado.push(habito);
    }

    return resultado;
  }

  async actualizarCalificacionHabito(
    id: string, 
    data: { 
      u1?: string; 
      u2?: string; 
      u3?: string; 
      u4?: string; 
      comentario?: string;
      esExtraescolar?: boolean;
    },
    docenteId: string
  ) {
    // Verificar si la calificación existe
    const [calificacionExistente] = await this.prisma.$queryRaw<CalificacionHabito[]>`
      SELECT * FROM "CalificacionHabito" WHERE "id" = ${id}::uuid
    `;

    if (!calificacionExistente) {
      throw new NotFoundException('Calificación no encontrada');
    }

    // Construir la consulta de actualización dinámica
    const updateFields: string[] = [];
    const values: (string | Date | null | boolean)[] = [id];
    let paramIndex = 2; // Empezamos desde 2 porque $1 es el ID

    // Si se está actualizando el campo esExtraescolar
    if (data.esExtraescolar !== undefined) {
      // Verificamos si la materia existe y es extracurricular
      const [materia] = await this.prisma.$queryRaw<any[]>`
        SELECT id FROM "Materia" 
        WHERE "id" = (SELECT "evaluacionHabitoId" FROM "CalificacionHabito" WHERE "id" = ${id}::uuid)
        AND "esExtraescolar" = true
      `;
      
      if (materia) {
        updateFields.push(`"esExtraescolar" = $${paramIndex}`);
        values.push(data.esExtraescolar);
        paramIndex++;
      }
    }

    if (data.u1 !== undefined) {
      updateFields.push(`"u1" = $${paramIndex}`);
      values.push(data.u1 || null);
      paramIndex++;
    }
    if (data.u2 !== undefined) {
      updateFields.push(`"u2" = $${paramIndex}`);
      values.push(data.u2 || null);
      paramIndex++;
    }
    if (data.u3 !== undefined) {
      updateFields.push(`"u3" = $${paramIndex}`);
      values.push(data.u3 || null);
      paramIndex++;
    }
    if (data.u4 !== undefined) {
      updateFields.push(`"u4" = $${paramIndex}`);
      values.push(data.u4 || null);
      paramIndex++;
    }
    if (data.comentario !== undefined) {
      updateFields.push(`"comentario" = $${paramIndex}`);
      values.push(data.comentario || null);
      paramIndex++;
    }

    // Agregar campos fijos
    updateFields.push(`"docenteId" = $${paramIndex}::uuid`);
    values.push(docenteId);
    paramIndex++;
    
    updateFields.push(`"updatedAt" = $${paramIndex}::timestamp`);
    values.push(new Date().toISOString());
    paramIndex++;

    const query = `
      UPDATE "CalificacionHabito"
      SET ${updateFields.join(', ')}
      WHERE "id" = $1::uuid
      RETURNING *,
        (SELECT row_to_json(eh) FROM "EvaluacionHabito" eh WHERE eh."id" = "evaluacionHabitoId") as "evaluacionHabito",
        (SELECT json_build_object('id', u."id", 'nombre', u."nombre", 'apellido', u."apellido")
         FROM "User" u WHERE u."id" = "docenteId") as "docente"
    `;

    const [updated] = await this.prisma.$queryRawUnsafe(query, ...values) as any[];
    return updated;
  }

  async crearCalificacionHabito(
    estudianteId: string,
    evaluacionHabitoId: string,
    periodoId: string,
    docenteId: string,
    data: {
      u1?: string;
      u2?: string;
      u3?: string;
      u4?: string;
      comentario?: string;
      esExtraescolar?: boolean;
    }
  ) {
    // Verificar si ya existe una calificación para este estudiante, evaluación y período
    const [existing] = await this.prisma.$queryRaw<CalificacionHabito[]>`
      SELECT * FROM "CalificacionHabito"
      WHERE "estudianteId" = ${estudianteId}::uuid
      AND "evaluacionHabitoId" = ${evaluacionHabitoId}::uuid
      AND "periodoId" = ${periodoId}::uuid
    `;

    if (existing) {
      return this.actualizarCalificacionHabito(existing.id, data, docenteId);
    }

    // Si es una materia extracurricular, buscamos su información
    let esMateriaExtra = false;
    if (data.esExtraescolar) {
      const [materia] = await this.prisma.$queryRaw<any[]>`
        SELECT id FROM "Materia" 
        WHERE "id" = ${evaluacionHabitoId}::uuid 
        AND "esExtraescolar" = true
      `;
      esMateriaExtra = !!materia;
    }

    // Crear nueva calificación
    const result = await this.prisma.$queryRaw`
      INSERT INTO "CalificacionHabito" (
        "id", "estudianteId", "evaluacionHabitoId", "periodoId", "docenteId",
        "u1", "u2", "u3", "u4", "comentario", "createdAt", "updatedAt",
        "esExtraescolar"
      ) VALUES (
        gen_random_uuid(), ${estudianteId}::uuid, ${evaluacionHabitoId}::uuid, 
        ${periodoId}::uuid, ${docenteId}::uuid,
        ${data.u1 || null}, ${data.u2 || null}, 
        ${data.u3 || null}, ${data.u4 || null}, 
        ${data.comentario || null}, NOW(), NOW(),
        ${esMateriaExtra}
      )
      RETURNING *,
        (SELECT row_to_json(eh) FROM "EvaluacionHabito" eh WHERE eh."id" = "evaluacionHabitoId") as "evaluacionHabito",
        (SELECT json_build_object('id', u."id", 'nombre', u."nombre", 'apellido', u."apellido")
         FROM "User" u WHERE u."id" = "docenteId") as "docente"
    ` as any[];

    return result[0];
  }

  async verificarPermisoDocente(docenteId: string, estudianteId: string): Promise<boolean> {
    // Implementar lógica para verificar si el docente tiene permiso para ver/editar este estudiante
    // Por ahora, devolvemos true para simplificar
    return true;
  }

  async obtenerResumenHabitos(estudianteId: string, periodoId: string): Promise<ResumenHabitos> {
    interface CalificacionWithEvaluacion extends CalificacionHabito {
      evaluacionHabito_nombre: string;
      evaluacionHabito_tipo: string;
    }

    const calificaciones = await this.prisma.$queryRaw<CalificacionWithEvaluacion[]>`
      SELECT ch.*, 
             eh."nombre" as "evaluacionHabito_nombre",
             eh."tipo" as "evaluacionHabito_tipo"
      FROM "CalificacionHabito" ch
      JOIN "EvaluacionHabito" eh ON ch."evaluacionHabitoId" = eh."id"
      WHERE ch."estudianteId" = ${estudianteId}::uuid
        AND ch."periodoId" = ${periodoId}::uuid
        AND eh."activo" = true
    `;

    // Inicializar el resumen con arrays vacíos
    const resumen: ResumenHabitos = {
      habito_casa: [],
      responsabilidad_aprendizaje: [],
      comportamiento: []
    };

    // Procesar cada calificación
    for (const cal of calificaciones) {
      const tipo = cal.evaluacionHabito_tipo as keyof ResumenHabitos;
      
      if (resumen[tipo]) {
        const habito: GrupoHabito = {
          id: cal.id,
          nombre: cal.evaluacionHabito_nombre,
          u1: cal.u1,
          u2: cal.u2,
          u3: cal.u3,
          u4: cal.u4,
          comentario: cal.comentario
        };
        
        resumen[tipo].push(habito);
      }
    }

    return resumen;
  }
}
