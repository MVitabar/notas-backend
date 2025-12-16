-- Remove any test extracurricular activities
DELETE FROM "Materia" WHERE "tipoMateriaId" IN (
  SELECT "id" FROM "TipoMateria" WHERE "nombre" = 'EXTRACURRICULAR'
);

-- Remove the test extracurricular type if it exists
DELETE FROM "TipoMateria" WHERE "nombre" = 'EXTRACURRICULAR';

-- Recreate the EXTRACURRICULAR type with a new ID
INSERT INTO "TipoMateria" ("id", "nombre", "descripcion", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'EXTRACURRICULAR', 'Actividades extracurriculares', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM "TipoMateria" WHERE "nombre" = 'EXTRACURRICULAR'
);

-- Ensure the tipoMateriaId column exists in Materia table
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
