-- Create the TipoMateria table if it doesn't exist
CREATE TABLE IF NOT EXISTS "TipoMateria" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "nombre" TEXT NOT NULL UNIQUE,
  "descripcion" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Create the EXTRACURRICULAR type if it doesn't exist
INSERT INTO "TipoMateria" ("id", "nombre", "descripcion", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'EXTRACURRICULAR', 'Actividades extracurriculares', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM "TipoMateria" WHERE "nombre" = 'EXTRACURRICULAR'
);

-- Add the tipoMateriaId column to the Materia table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'Materia' AND column_name = 'tipoMateriaId'
  ) THEN
    ALTER TABLE "Materia" 
    ADD COLUMN "tipoMateriaId" UUID REFERENCES "TipoMateria"("id") ON DELETE SET NULL;
  END IF;
END $$;
