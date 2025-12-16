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
