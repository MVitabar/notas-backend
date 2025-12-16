-- Step 1: Drop the old unique constraint
DROP INDEX IF EXISTS "UserMateria_docenteId_materiaId_seccion_periodo_key";

-- Step 2: Add the new column as nullable first
ALTER TABLE "UserMateria" ADD COLUMN "periodoAcademicoId" TEXT;

-- Step 3: Create the PeriodoAcademico table
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

    CONSTRAINT "PeriodoAcademico_pkey" PRIMARY KEY ("id")
);

-- Step 4: Create a default academic period for existing data
WITH default_period AS (
  INSERT INTO "PeriodoAcademico" 
    ("id", "name", "startDate", "endDate", "isCurrent", "description", "status", "updatedAt")
  VALUES 
    (gen_random_uuid(), '2025-1', CURRENT_DATE, (CURRENT_DATE + INTERVAL '6 months')::date, true, 'Default academic period', 'active', NOW())
  RETURNING id
)
-- Step 5: Update existing UserMateria records to use the default period
UPDATE "UserMateria" 
SET "periodoAcademicoId" = (SELECT id FROM default_period LIMIT 1);

-- Step 6: Now make the column required
ALTER TABLE "UserMateria" ALTER COLUMN "periodoAcademicoId" SET NOT NULL;

-- Step 7: Create indexes for PeriodoAcademico
CREATE UNIQUE INDEX "PeriodoAcademico_name_key" ON "PeriodoAcademico"("name");
CREATE INDEX "PeriodoAcademico_isCurrent_idx" ON "PeriodoAcademico"("isCurrent");
CREATE INDEX "PeriodoAcademico_status_idx" ON "PeriodoAcademico"("status");

-- Step 8: Create the new unique constraint
CREATE UNIQUE INDEX "UserMateria_docenteId_materiaId_seccion_periodoAcademicoId_key" 
ON "UserMateria"("docenteId", "materiaId", "seccion", "periodoAcademicoId");

-- Step 9: Add the foreign key constraint
ALTER TABLE "UserMateria" 
ADD CONSTRAINT "UserMateria_periodoAcademicoId_fkey" 
FOREIGN KEY ("periodoAcademicoId") 
REFERENCES "PeriodoAcademico"("id") 
ON DELETE RESTRICT 
ON UPDATE CASCADE;
