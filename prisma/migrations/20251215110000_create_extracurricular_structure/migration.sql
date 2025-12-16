-- Ensure the EXTRACURRICULAR type exists
-- This is a no-op if the type already exists
INSERT INTO "TipoMateria" (id, nombre, descripcion, "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'EXTRACURRICULAR', 'Actividades extracurriculares', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM "TipoMateria" WHERE nombre = 'EXTRACURRICULAR'
);
