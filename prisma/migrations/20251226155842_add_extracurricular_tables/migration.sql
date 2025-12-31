/*
  Warnings:

  - A unique constraint covering the columns `[estudianteId,materiaId,periodoId,tipoEvaluacion,unidad]` on the table `Calificacion` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TipoCalificacion" ADD VALUE 'HABITO';
ALTER TYPE "TipoCalificacion" ADD VALUE 'RESPONSABILIDAD';

-- DropIndex
DROP INDEX "Calificacion_estudianteId_materiaId_periodoId_tipoEvaluacio_key";

-- AlterTable
ALTER TABLE "Calificacion" ADD COLUMN     "unidad" TEXT;

-- AlterTable
ALTER TABLE "Materia" ADD COLUMN     "esExtracurricular" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "orden" INTEGER;

-- CreateTable
CREATE TABLE "EvaluacionHabito" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "tipo" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "materiaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EvaluacionHabito_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalificacionHabito" (
    "id" TEXT NOT NULL,
    "estudianteId" TEXT NOT NULL,
    "evaluacionHabitoId" TEXT NOT NULL,
    "periodoId" TEXT NOT NULL,
    "docenteId" TEXT NOT NULL,
    "u1" TEXT,
    "u2" TEXT,
    "u3" TEXT,
    "u4" TEXT,
    "comentario" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CalificacionHabito_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EvaluacionHabito_tipo_idx" ON "EvaluacionHabito"("tipo");

-- CreateIndex
CREATE INDEX "EvaluacionHabito_orden_idx" ON "EvaluacionHabito"("orden");

-- CreateIndex
CREATE INDEX "EvaluacionHabito_materiaId_idx" ON "EvaluacionHabito"("materiaId");

-- CreateIndex
CREATE UNIQUE INDEX "EvaluacionHabito_nombre_tipo_key" ON "EvaluacionHabito"("nombre", "tipo");

-- CreateIndex
CREATE INDEX "CalificacionHabito_estudianteId_idx" ON "CalificacionHabito"("estudianteId");

-- CreateIndex
CREATE INDEX "CalificacionHabito_evaluacionHabitoId_idx" ON "CalificacionHabito"("evaluacionHabitoId");

-- CreateIndex
CREATE INDEX "CalificacionHabito_periodoId_idx" ON "CalificacionHabito"("periodoId");

-- CreateIndex
CREATE INDEX "CalificacionHabito_docenteId_idx" ON "CalificacionHabito"("docenteId");

-- CreateIndex
CREATE UNIQUE INDEX "CalificacionHabito_estudianteId_evaluacionHabitoId_periodoI_key" ON "CalificacionHabito"("estudianteId", "evaluacionHabitoId", "periodoId");

-- CreateIndex
CREATE INDEX "Calificacion_unidad_idx" ON "Calificacion"("unidad");

-- CreateIndex
CREATE UNIQUE INDEX "Calificacion_estudianteId_materiaId_periodoId_tipoEvaluacio_key" ON "Calificacion"("estudianteId", "materiaId", "periodoId", "tipoEvaluacion", "unidad");

-- CreateIndex
CREATE INDEX "Materia_esExtracurricular_idx" ON "Materia"("esExtracurricular");

-- CreateIndex
CREATE INDEX "Materia_orden_idx" ON "Materia"("orden");

-- AddForeignKey
ALTER TABLE "EvaluacionHabito" ADD CONSTRAINT "EvaluacionHabito_materiaId_fkey" FOREIGN KEY ("materiaId") REFERENCES "Materia"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalificacionHabito" ADD CONSTRAINT "CalificacionHabito_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalificacionHabito" ADD CONSTRAINT "CalificacionHabito_evaluacionHabitoId_fkey" FOREIGN KEY ("evaluacionHabitoId") REFERENCES "EvaluacionHabito"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalificacionHabito" ADD CONSTRAINT "CalificacionHabito_periodoId_fkey" FOREIGN KEY ("periodoId") REFERENCES "PeriodoAcademico"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalificacionHabito" ADD CONSTRAINT "CalificacionHabito_docenteId_fkey" FOREIGN KEY ("docenteId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
