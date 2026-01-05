-- AlterTable
ALTER TABLE "Materia" ADD COLUMN     "grados" TEXT[] DEFAULT '[]';

-- CreateIndex
CREATE INDEX "Materia_grados_idx" ON "Materia" USING GIN ("grados");
