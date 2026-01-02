/*
  Warnings:

  - The `tipo` column on the `EvaluacionHabito` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "EvaluacionTipo" AS ENUM ('EXTRACURRICULAR', 'COMPORTAMIENTO', 'APRENDIZAJE', 'CASA');

-- AlterTable
ALTER TABLE "EvaluacionHabito" DROP COLUMN "tipo",
ADD COLUMN     "tipo" "EvaluacionTipo" NOT NULL DEFAULT 'APRENDIZAJE';

-- CreateIndex
CREATE INDEX "EvaluacionHabito_tipo_idx" ON "EvaluacionHabito"("tipo");

-- CreateIndex
CREATE UNIQUE INDEX "EvaluacionHabito_nombre_tipo_key" ON "EvaluacionHabito"("nombre", "tipo");
