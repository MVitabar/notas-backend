import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verificarMateriasExistentes() {
  try {
    console.log('🔍 Verificando materias existentes...');

    // IDs de materia que se intentan usar en las evaluaciones
    const materiaIdsRequeridos = [
      '14dab7e3-ff63-49fd-b216-93f0400448fb', // Lee diariamente en casa
      'cbbad73d-4bfe-4604-8a83-567debfe20ba', // Viene preparado para aprender
      '5c9e04b0-2228-495e-9285-e847aa3b3e94', // Responsable en Clase
      'cd9b9917-77d9-4d67-ba75-410092b9e3e2', // MORAL CRISTIANA
      'a8f77675-fd61-4769-9714-0d8b96023bb1', // Práctica valores morales diariamente
      'edd0e07c-9a79-45ac-90a8-cba30704e991', // ATIENDE JUNTAS DE PADRES
      '01039d20-49bc-4134-bc66-38206474eb87', // Práctica vocabulario de inglés diariamente
      '3a6e9d11-9f5c-496e-8c5f-38d99c18174f', // Lógica Matemática
      'a5b1fce7-0e89-4840-ad80-1f77633a5272', // PROGRAMA DE LECTURA
      '11ba16e8-23a1-4ccd-a9f3-0172d95824d1', // Termina tareas
      '39618238-1f77-416b-b9cd-7f61cca7fade', // Completa Trabajos a Tiempo
      '2e5046a5-4817-4d0e-8473-f088920e90b6', // INTERACTÚA BIEN CON SUS COMPAÑEROS
      '7c996399-5538-4ebd-9f02-80db0ef78c9f', // Respeta los derechos y propiedades de otros
      'fbc787ec-4c90-4b28-8176-7a1d62299e16', // Demuestra control de sí mismo
      '7e5ad2f9-4307-4ebf-bcbd-33176798cbda', // LLEGA A TIEMPO
      '80a02649-7b71-40da-a963-fe26ef0ee048', // RAZONAMIENTO VERBAL
      '3dab1183-39c0-4de4-aba8-ee191642865c', // Práctica diariamente lo estudiado
      '48a4180b-eea4-4e38-b9f8-f5f148c4037b', // Lógica Matemática
      '1566c82b-4fce-426d-a024-da20f1c35f0f', // Práctica Valores Morales diariamente
      'a2dc524b-eaa8-42cf-9f6d-72ef9ba8bd99', // Interactúa bien con sus compañeros
      '85f861a6-3faa-4c93-b779-1678cced8140', // Participa en actividades de aprendizaje
      '7692f960-c8e6-4d0d-88c9-1162e08b0aff', // Moral Cristiana
      'f55c7e8e-d2e6-4946-9f4b-c41f64b37cce', // Respeta Autoridad
      '4cc25790-08b6-4a7f-ad41-aa2045045896', // RESPETA AUTORIDAD
      '061ef5cc-7f7c-47a8-a149-d3bd323df074', // TICS
      'a8551599-9e71-4895-88c6-a984bad43dd1', // Acepta responsabilidad de sus acciones
      'ba69fc87-e57f-40ae-9254-4629f3495585', // Práctica diariamente lo estudiado
      'c6ef15d7-4d11-439d-a16f-c5b218e90542', // Práctica Valores Morales diariamente
      'a2dc524b-eaa8-42cf-9f6d-72ef9ba8bd99', // Interactúa bien con sus compañeros
      '85f861a6-3faa-4c93-b779-1678cced8140', // Participa en actividades de aprendizaje
      '7692f960-c8e6-4d0d-88c9-1162e08b0aff', // Moral Cristiana
      'f54e7bd4-dbf4-4c1b-ae5a-6959ac733fe6', // Respeta Autoridad
      '4cc25790-08b6-4a7f-ad41-aa2045045896', // RESPETA AUTORIDAD
      '06917dfb-2811-4a8f-ab46-88f4aeaed3b7', // TICS
      'a8551599-9e71-4895-88c6-a984bad43dd1', // Acepta responsabilidad de sus acciones
      'ba69fc87-e57f-40ae-9254-4629f3495585', // Práctica diariamente lo estudiado
      'c6ef15d7-4d11-439d-a16f-c5b218e90542', // Práctica Valores Morales diariamente
      'a2dc524b-eaa8-42cf-9f6d-72ef9ba8bd99', // Interactúa bien con sus compañeros
      '85f861a6-3faa-4c93-b779-1678cced8140', // Participa en actividades de aprendizaje
      '7692f960-c8e6-4d0d-88c9-1162e08b0aff', // Moral Cristiana
      'f54e7bd4-dbf4-4c1b-ae5a-6959ac733fe6', // Respeta Autoridad
      '4cc25790-08b6-4a7f-ad41-aa2045045896', // RESPETA AUTORIDAD
      '061ef5cc-7f7c-47a8-a149-d3bd323df074', // TICS
      'a8551599-9e71-4895-88c6-a984bad43dd1', // Acepta responsabilidad de sus acciones
      'ba69fc87-e57f-40ae-9254-4629f3495585', // Práctica diariamente lo estudiado
      'c6ef15d7-4d11-439d-a16f-c5b218e90542', // Práctica Valores Morales diariamente
      'a2dc524b-eaa8-42cf-9f6d-72ef9ba8bd99', // Interactúa bien con sus compañeros
      '85f861a6-3faa-4c93-b779-1678cced8140', // Participa en actividades de aprendizaje
      '7692f960-c8e6-4d0d-88c9-1162e08b0aff', // Moral Cristiana
      'f54e7bd4-dbf4-4c1b-ae5a-6959ac733fe6', // Respeta Autoridad
      '4cc25790-08b6-4a7f-ad41-aa2045045896', // RESPETA AUTORIDAD
      '061ef5cc-7f7c-47a8-a149-d3bd323df074', // TICS
      'a8551599-9e71-4895-88c6-a984bad43dd1', // Acepta responsabilidad de sus acciones
      '23ca1fde-236d-4325-abd9-44446e1c9124' // Acepta responsabilidad de sus acciones
    ];

    console.log(`🔍 Verificando ${materiaIdsRequeridos.length} IDs de materia...`);

    let encontrados = 0;
    let noEncontrados = 0;

    for (const materiaId of materiaIdsRequeridos) {
      const materia = await prisma.materia.findUnique({
        where: { id: materiaId },
        select: { id: true, nombre: true }
      });

      if (materia) {
        console.log(`✅ ${materiaId}: ${materia.nombre}`);
        encontrados++;
      } else {
        console.log(`❌ ${materiaId}: NO ENCONTRADO`);
        noEncontrados++;
      }
    }

    console.log(`\n📊 Resumen:`);
    console.log(`✅ Encontrados: ${encontrados}`);
    console.log(`❌ No encontrados: ${noEncontrados}`);
    console.log(`📈 Total verificados: ${materiaIdsRequeridos.length}`);

    // Mostrar algunas materias que sí existen para referencia
    if (noEncontrados > 0) {
      console.log('\n📚 Materias que sí existen en la base de datos:');
      const materiasExistentes = await prisma.materia.findMany({
        select: { id: true, nombre: true },
        take: 10
      });
      
      materiasExistentes.forEach(m => {
        console.log(`  - ${m.id}: ${m.nombre}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarMateriasExistentes();
