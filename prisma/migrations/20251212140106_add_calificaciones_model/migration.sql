-- CreateTable
CREATE TABLE "Calificacion" (
    "id" TEXT NOT NULL,
    "estudianteId" TEXT NOT NULL,
    "materiaId" TEXT NOT NULL,
    "periodoId" TEXT NOT NULL,
    "docenteId" TEXT NOT NULL,
    "calificacion" DOUBLE PRECISION NOT NULL,
    "tipoEvaluacion" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "comentario" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Calificacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Calificacion_estudianteId_idx" ON "Calificacion"("estudianteId");

-- CreateIndex
CREATE INDEX "Calificacion_materiaId_idx" ON "Calificacion"("materiaId");

-- CreateIndex
CREATE INDEX "Calificacion_periodoId_idx" ON "Calificacion"("periodoId");

-- CreateIndex
CREATE INDEX "Calificacion_docenteId_idx" ON "Calificacion"("docenteId");

-- CreateIndex
CREATE UNIQUE INDEX "Calificacion_estudianteId_materiaId_periodoId_tipoEvaluacio_key" ON "Calificacion"("estudianteId", "materiaId", "periodoId", "tipoEvaluacion");

-- AddForeignKey
ALTER TABLE "Calificacion" ADD CONSTRAINT "Calificacion_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Calificacion" ADD CONSTRAINT "Calificacion_materiaId_fkey" FOREIGN KEY ("materiaId") REFERENCES "Materia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Calificacion" ADD CONSTRAINT "Calificacion_periodoId_fkey" FOREIGN KEY ("periodoId") REFERENCES "PeriodoAcademico"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Calificacion" ADD CONSTRAINT "Calificacion_docenteId_fkey" FOREIGN KEY ("docenteId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
