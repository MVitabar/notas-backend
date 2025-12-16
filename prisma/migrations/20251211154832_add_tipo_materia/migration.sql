/*
  Warnings:

  - You are about to drop the `Grado` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GradoMateria` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `NivelEducativo` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_GradoEstudiantes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_GradosDocentes` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[nombre]` on the table `Materia` will be added. If there are existing duplicate values, this will fail.
  - Made the column `codigo` on table `Materia` required. This step will fail if there are existing NULL values in that column.
  - Made the column `creditos` on table `Materia` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Grado" DROP CONSTRAINT "Grado_nivelEducativoId_fkey";

-- DropForeignKey
ALTER TABLE "GradoMateria" DROP CONSTRAINT "GradoMateria_gradoId_fkey";

-- DropForeignKey
ALTER TABLE "GradoMateria" DROP CONSTRAINT "GradoMateria_materiaId_fkey";

-- DropForeignKey
ALTER TABLE "Materia" DROP CONSTRAINT "Materia_tipoMateriaId_fkey";

-- DropForeignKey
ALTER TABLE "_GradoEstudiantes" DROP CONSTRAINT "_GradoEstudiantes_A_fkey";

-- DropForeignKey
ALTER TABLE "_GradoEstudiantes" DROP CONSTRAINT "_GradoEstudiantes_B_fkey";

-- DropForeignKey
ALTER TABLE "_GradosDocentes" DROP CONSTRAINT "_GradosDocentes_A_fkey";

-- DropForeignKey
ALTER TABLE "_GradosDocentes" DROP CONSTRAINT "_GradosDocentes_B_fkey";

-- DropIndex
DROP INDEX "Materia_nombre_tipoMateriaId_key";

-- AlterTable
ALTER TABLE "Materia" ALTER COLUMN "codigo" SET NOT NULL,
ALTER COLUMN "creditos" SET NOT NULL,
ALTER COLUMN "tipoMateriaId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "grados" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "TeacherProfile" ADD COLUMN     "grados" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- DropTable
DROP TABLE "Grado";

-- DropTable
DROP TABLE "GradoMateria";

-- DropTable
DROP TABLE "NivelEducativo";

-- DropTable
DROP TABLE "_GradoEstudiantes";

-- DropTable
DROP TABLE "_GradosDocentes";

-- CreateIndex
CREATE UNIQUE INDEX "Materia_nombre_key" ON "Materia"("nombre");

-- AddForeignKey
ALTER TABLE "Materia" ADD CONSTRAINT "Materia_tipoMateriaId_fkey" FOREIGN KEY ("tipoMateriaId") REFERENCES "TipoMateria"("id") ON DELETE SET NULL ON UPDATE CASCADE;
