-- AlterTable
ALTER TABLE "Calificacion" ADD COLUMN     "unidad" TEXT;

-- CreateIndex
CREATE INDEX "Calificacion_unidad_idx" ON "Calificacion"("unidad");
