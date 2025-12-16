-- Create the extracurricular subject type if it doesn't exist
INSERT INTO "TipoMateria" (id, nombre, descripcion, "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'EXTRACURRICULAR', 'Actividades extracurriculares', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM "TipoMateria" WHERE nombre = 'EXTRACURRICULAR'
);

-- Add common extracurricular activities
WITH tipos AS (
  SELECT id FROM "TipoMateria" WHERE nombre = 'EXTRACURRICULAR' LIMIT 1
)
INSERT INTO "Materia" (id, nombre, codigo, descripcion, creditos, activa, "tipoMateriaId", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
  act.nombre,
  act.codigo,
  act.descripcion,
  0, -- 0 credits for extracurricular activities
  true,
  tipos.id,
  NOW(),
  NOW()
FROM (
  VALUES 
    ('Programa de Lectura', 'EXT-LECT', 'Programa de fomento a la lectura'),
    ('Deportes', 'EXT-DEP', 'Actividades deportivas'),
    ('Arte', 'EXT-ART', 'Actividades artísticas'),
    ('Música', 'EXT-MUS', 'Actividades musicales'),
    ('Teatro', 'EXT-TEA', 'Taller de teatro'),
    ('Robótica', 'EXT-ROB', 'Taller de robótica')
) AS act(nombre, codigo, descripcion)
CROSS JOIN tipos
WHERE NOT EXISTS (
  SELECT 1 FROM "Materia" WHERE codigo = act.codigo
);
