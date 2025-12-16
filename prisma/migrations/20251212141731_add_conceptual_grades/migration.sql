/*
  Warnings:

  - Added the required column `tipoCalificacion` to the `Calificacion` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TipoCalificacion" AS ENUM ('NUMERICA', 'CONCEPTUAL');

-- CreateEnum
CREATE TYPE "ValorConceptual" AS ENUM ('DESTACA', 'AVANZA', 'NECESITA_MEJORAR', 'INSATISFACTORIO');

-- AlterTable
ALTER TABLE "Calificacion" ADD COLUMN     "tipoCalificacion" "TipoCalificacion" NOT NULL,
ADD COLUMN     "valorConceptual" "ValorConceptual",
ALTER COLUMN "calificacion" DROP NOT NULL,
ALTER COLUMN "calificacion" DROP DEFAULT;
