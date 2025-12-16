/*
  Warnings:

  - You are about to drop the `MateriaEnCurso` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "MateriaEnCurso" DROP CONSTRAINT "MateriaEnCurso_docenteId_fkey";

-- DropForeignKey
ALTER TABLE "MateriaEnCurso" DROP CONSTRAINT "MateriaEnCurso_materiaId_fkey";

-- DropTable
DROP TABLE "MateriaEnCurso";

-- CreateTable
CREATE TABLE "UserMateria" (
    "id" TEXT NOT NULL,
    "docenteId" TEXT NOT NULL,
    "materiaId" TEXT NOT NULL,
    "seccion" TEXT NOT NULL,
    "horario" TEXT NOT NULL,
    "periodo" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'activo',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserMateria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserMateria_docenteId_materiaId_seccion_periodo_key" ON "UserMateria"("docenteId", "materiaId", "seccion", "periodo");

-- AddForeignKey
ALTER TABLE "UserMateria" ADD CONSTRAINT "UserMateria_docenteId_fkey" FOREIGN KEY ("docenteId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMateria" ADD CONSTRAINT "UserMateria_materiaId_fkey" FOREIGN KEY ("materiaId") REFERENCES "Materia"("id") ON DELETE CASCADE ON UPDATE CASCADE;
