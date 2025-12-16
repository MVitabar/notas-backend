/*
  Warnings:

  - You are about to drop the column `grados` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `grados` on the `TeacherProfile` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[nombre,tipoMateriaId]` on the table `Materia` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tipoMateriaId` to the `Materia` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Materia_nombre_key";

-- AlterTable
ALTER TABLE "Materia" ADD COLUMN     "tipoMateriaId" TEXT NOT NULL,
ALTER COLUMN "codigo" DROP NOT NULL,
ALTER COLUMN "creditos" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "grados";

-- AlterTable
ALTER TABLE "TeacherProfile" DROP COLUMN "grados";

-- CreateTable
CREATE TABLE "NivelEducativo" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,
    "descripcion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NivelEducativo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Grado" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "nombreCorto" TEXT,
    "nivelEducativoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Grado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TipoMateria" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TipoMateria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GradoMateria" (
    "id" TEXT NOT NULL,
    "gradoId" TEXT NOT NULL,
    "materiaId" TEXT NOT NULL,
    "orden" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GradoMateria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_GradoEstudiantes" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_GradosDocentes" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "NivelEducativo_nombre_key" ON "NivelEducativo"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "NivelEducativo_orden_key" ON "NivelEducativo"("orden");

-- CreateIndex
CREATE UNIQUE INDEX "Grado_nombre_key" ON "Grado"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Grado_nombre_nivelEducativoId_key" ON "Grado"("nombre", "nivelEducativoId");

-- CreateIndex
CREATE UNIQUE INDEX "TipoMateria_nombre_key" ON "TipoMateria"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "GradoMateria_gradoId_materiaId_key" ON "GradoMateria"("gradoId", "materiaId");

-- CreateIndex
CREATE UNIQUE INDEX "_GradoEstudiantes_AB_unique" ON "_GradoEstudiantes"("A", "B");

-- CreateIndex
CREATE INDEX "_GradoEstudiantes_B_index" ON "_GradoEstudiantes"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_GradosDocentes_AB_unique" ON "_GradosDocentes"("A", "B");

-- CreateIndex
CREATE INDEX "_GradosDocentes_B_index" ON "_GradosDocentes"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Materia_nombre_tipoMateriaId_key" ON "Materia"("nombre", "tipoMateriaId");

-- AddForeignKey
ALTER TABLE "Grado" ADD CONSTRAINT "Grado_nivelEducativoId_fkey" FOREIGN KEY ("nivelEducativoId") REFERENCES "NivelEducativo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Materia" ADD CONSTRAINT "Materia_tipoMateriaId_fkey" FOREIGN KEY ("tipoMateriaId") REFERENCES "TipoMateria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GradoMateria" ADD CONSTRAINT "GradoMateria_gradoId_fkey" FOREIGN KEY ("gradoId") REFERENCES "Grado"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GradoMateria" ADD CONSTRAINT "GradoMateria_materiaId_fkey" FOREIGN KEY ("materiaId") REFERENCES "Materia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GradoEstudiantes" ADD CONSTRAINT "_GradoEstudiantes_A_fkey" FOREIGN KEY ("A") REFERENCES "Grado"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GradoEstudiantes" ADD CONSTRAINT "_GradoEstudiantes_B_fkey" FOREIGN KEY ("B") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GradosDocentes" ADD CONSTRAINT "_GradosDocentes_A_fkey" FOREIGN KEY ("A") REFERENCES "Grado"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GradosDocentes" ADD CONSTRAINT "_GradosDocentes_B_fkey" FOREIGN KEY ("B") REFERENCES "TeacherProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
