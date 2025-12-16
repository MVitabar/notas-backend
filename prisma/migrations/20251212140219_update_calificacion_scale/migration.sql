/*
  Warnings:

  - You are about to alter the column `calificacion` on the `Calificacion` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `SmallInt`.

*/
-- AlterTable
ALTER TABLE "Calificacion" ALTER COLUMN "calificacion" SET DEFAULT 0,
ALTER COLUMN "calificacion" SET DATA TYPE SMALLINT;
