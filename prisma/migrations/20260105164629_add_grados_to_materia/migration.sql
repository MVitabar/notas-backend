-- AlterTable
ALTER TABLE "Materia" ADD COLUMN     "grados" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateIndex
CREATE INDEX "Materia_grados_idx" ON "Materia"("grados");
