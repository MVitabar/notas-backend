-- CreateEnum
CREATE TYPE "EvaluacionTipo" AS ENUM ('EXTRACURRICULAR', 'COMPORTAMIENTO', 'APRENDIZAJE', 'CASA');

-- CreateEnum
CREATE TYPE "TipoCalificacion" AS ENUM ('NUMERICA', 'CONCEPTUAL', 'HABITO', 'RESPONSABILIDAD');

-- CreateEnum
CREATE TYPE "ValorConceptual" AS ENUM ('DESTACA', 'AVANZA', 'NECESITA_MEJORAR', 'INSATISFACTORIO');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USUARIO', 'DOCENTE', 'ADMIN', 'ESTUDIANTE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "apellido" TEXT,
    "direccion" TEXT,
    "fechaNacimiento" TIMESTAMP(3),
    "telefono" TEXT,
    "contactoEmergencia" TEXT,
    "dni" TEXT,
    "requiresPasswordChange" BOOLEAN NOT NULL DEFAULT true,
    "telefonoEmergencia" TEXT,
    "rol" "UserRole" NOT NULL DEFAULT 'USUARIO',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contactoEmergencia" TEXT,
    "telefonoEmergencia" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "grados" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "TeacherProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Materia" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "codigo" TEXT NOT NULL,
    "creditos" INTEGER NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "esExtracurricular" BOOLEAN NOT NULL DEFAULT false,
    "orden" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tipoMateriaId" TEXT,

    CONSTRAINT "Materia_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "PeriodoAcademico" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'upcoming',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "unidadAsignada" TEXT,

    CONSTRAINT "PeriodoAcademico_pkey" PRIMARY KEY ("id")
);

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
    "periodoAcademicoId" TEXT NOT NULL,

    CONSTRAINT "UserMateria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "fechaNacimiento" TIMESTAMP(3) NOT NULL,
    "dni" TEXT NOT NULL,
    "direccion" TEXT,
    "telefono" TEXT,
    "contactoEmergencia" TEXT,
    "telefonoEmergencia" TEXT,
    "email" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "materias" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "grados" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Calificacion" (
    "id" TEXT NOT NULL,
    "estudianteId" TEXT NOT NULL,
    "materiaId" TEXT NOT NULL,
    "periodoId" TEXT NOT NULL,
    "docenteId" TEXT NOT NULL,
    "calificacion" SMALLINT,
    "tipoEvaluacion" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "comentario" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tipoCalificacion" "TipoCalificacion" NOT NULL,
    "valorConceptual" "ValorConceptual",
    "unidad" TEXT,

    CONSTRAINT "Calificacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvaluacionHabito" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "tipo" "EvaluacionTipo" NOT NULL DEFAULT 'APRENDIZAJE',
    "orden" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "materiaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EvaluacionHabito_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalificacionHabito" (
    "id" TEXT NOT NULL,
    "estudianteId" TEXT NOT NULL,
    "evaluacionHabitoId" TEXT NOT NULL,
    "periodoId" TEXT NOT NULL,
    "docenteId" TEXT NOT NULL,
    "u1" TEXT,
    "u2" TEXT,
    "u3" TEXT,
    "u4" TEXT,
    "comentario" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CalificacionHabito_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherProfile_userId_key" ON "TeacherProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Materia_nombre_key" ON "Materia"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Materia_codigo_key" ON "Materia"("codigo");

-- CreateIndex
CREATE INDEX "Materia_esExtracurricular_idx" ON "Materia"("esExtracurricular");

-- CreateIndex
CREATE INDEX "Materia_orden_idx" ON "Materia"("orden");

-- CreateIndex
CREATE UNIQUE INDEX "TipoMateria_nombre_key" ON "TipoMateria"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "PeriodoAcademico_name_key" ON "PeriodoAcademico"("name");

-- CreateIndex
CREATE INDEX "PeriodoAcademico_isCurrent_idx" ON "PeriodoAcademico"("isCurrent");

-- CreateIndex
CREATE INDEX "PeriodoAcademico_status_idx" ON "PeriodoAcademico"("status");

-- CreateIndex
CREATE INDEX "PeriodoAcademico_unidadAsignada_idx" ON "PeriodoAcademico"("unidadAsignada");

-- CreateIndex
CREATE UNIQUE INDEX "UserMateria_docenteId_materiaId_seccion_periodoAcademicoId_key" ON "UserMateria"("docenteId", "materiaId", "seccion", "periodoAcademicoId");

-- CreateIndex
CREATE UNIQUE INDEX "Student_dni_key" ON "Student"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "Student_email_key" ON "Student"("email");

-- CreateIndex
CREATE INDEX "Calificacion_estudianteId_idx" ON "Calificacion"("estudianteId");

-- CreateIndex
CREATE INDEX "Calificacion_materiaId_idx" ON "Calificacion"("materiaId");

-- CreateIndex
CREATE INDEX "Calificacion_periodoId_idx" ON "Calificacion"("periodoId");

-- CreateIndex
CREATE INDEX "Calificacion_docenteId_idx" ON "Calificacion"("docenteId");

-- CreateIndex
CREATE INDEX "Calificacion_unidad_idx" ON "Calificacion"("unidad");

-- CreateIndex
CREATE UNIQUE INDEX "Calificacion_estudianteId_materiaId_periodoId_tipoEvaluacio_key" ON "Calificacion"("estudianteId", "materiaId", "periodoId", "tipoEvaluacion", "unidad");

-- CreateIndex
CREATE INDEX "EvaluacionHabito_tipo_idx" ON "EvaluacionHabito"("tipo");

-- CreateIndex
CREATE INDEX "EvaluacionHabito_orden_idx" ON "EvaluacionHabito"("orden");

-- CreateIndex
CREATE INDEX "EvaluacionHabito_materiaId_idx" ON "EvaluacionHabito"("materiaId");

-- CreateIndex
CREATE UNIQUE INDEX "EvaluacionHabito_nombre_tipo_key" ON "EvaluacionHabito"("nombre", "tipo");

-- CreateIndex
CREATE INDEX "CalificacionHabito_estudianteId_idx" ON "CalificacionHabito"("estudianteId");

-- CreateIndex
CREATE INDEX "CalificacionHabito_evaluacionHabitoId_idx" ON "CalificacionHabito"("evaluacionHabitoId");

-- CreateIndex
CREATE INDEX "CalificacionHabito_periodoId_idx" ON "CalificacionHabito"("periodoId");

-- CreateIndex
CREATE INDEX "CalificacionHabito_docenteId_idx" ON "CalificacionHabito"("docenteId");

-- CreateIndex
CREATE UNIQUE INDEX "CalificacionHabito_estudianteId_evaluacionHabitoId_periodoI_key" ON "CalificacionHabito"("estudianteId", "evaluacionHabitoId", "periodoId");

-- AddForeignKey
ALTER TABLE "TeacherProfile" ADD CONSTRAINT "TeacherProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Materia" ADD CONSTRAINT "Materia_tipoMateriaId_fkey" FOREIGN KEY ("tipoMateriaId") REFERENCES "TipoMateria"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMateria" ADD CONSTRAINT "UserMateria_docenteId_fkey" FOREIGN KEY ("docenteId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMateria" ADD CONSTRAINT "UserMateria_materiaId_fkey" FOREIGN KEY ("materiaId") REFERENCES "Materia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMateria" ADD CONSTRAINT "UserMateria_periodoAcademicoId_fkey" FOREIGN KEY ("periodoAcademicoId") REFERENCES "PeriodoAcademico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Calificacion" ADD CONSTRAINT "Calificacion_docenteId_fkey" FOREIGN KEY ("docenteId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Calificacion" ADD CONSTRAINT "Calificacion_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Calificacion" ADD CONSTRAINT "Calificacion_materiaId_fkey" FOREIGN KEY ("materiaId") REFERENCES "Materia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Calificacion" ADD CONSTRAINT "Calificacion_periodoId_fkey" FOREIGN KEY ("periodoId") REFERENCES "PeriodoAcademico"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluacionHabito" ADD CONSTRAINT "EvaluacionHabito_materiaId_fkey" FOREIGN KEY ("materiaId") REFERENCES "Materia"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalificacionHabito" ADD CONSTRAINT "CalificacionHabito_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalificacionHabito" ADD CONSTRAINT "CalificacionHabito_evaluacionHabitoId_fkey" FOREIGN KEY ("evaluacionHabitoId") REFERENCES "EvaluacionHabito"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalificacionHabito" ADD CONSTRAINT "CalificacionHabito_periodoId_fkey" FOREIGN KEY ("periodoId") REFERENCES "PeriodoAcademico"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalificacionHabito" ADD CONSTRAINT "CalificacionHabito_docenteId_fkey" FOREIGN KEY ("docenteId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
