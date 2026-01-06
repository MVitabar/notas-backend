/*
  Warnings:

  - A unique constraint covering the columns `[estudianteId,materiaId,periodoId,tipoEvaluacion]` on the table `Calificacion` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Calificacion_estudianteId_materiaId_periodoId_tipoEvaluacio_key";

-- CreateIndex
CREATE UNIQUE INDEX "Calificacion_estudianteId_materiaId_periodoId_tipoEvaluacio_key" ON "Calificacion"("estudianteId", "materiaId", "periodoId", "tipoEvaluacion");
