/*
  Warnings:

  - You are about to drop the column `unidad` on the `Calificacion` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Calificacion_unidad_idx";

-- AlterTable
ALTER TABLE "Calificacion" DROP COLUMN "unidad";
