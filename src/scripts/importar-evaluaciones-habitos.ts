import { PrismaClient, EvaluacionTipo } from '@prisma/client';

const prisma = new PrismaClient();

async function importarEvaluacionesHabitos() {
  try {
    console.log('📥 Importando evaluaciones de hábitos...');

    // Mapear los strings a los tipos del enum
    const tipoMap: Record<string, EvaluacionTipo> = {
      'CASA': EvaluacionTipo.CASA,
      'COMPORTAMIENTO': EvaluacionTipo.COMPORTAMIENTO,
      'EXTRACURRICULAR': EvaluacionTipo.EXTRACURRICULAR,
      'APRENDIZAJE': EvaluacionTipo.APRENDIZAJE
    };

    // Datos proporcionados por el usuario
    const evaluacionesData = [
      { id: '06f4429e-3823-48a4-a43f-85c932301108', nombre: 'Lee diariamente en casa', descripcion: 'Evaluación de Lee diariamente en casa', tipo: tipoMap['CASA'], orden: 999, activo: true, materiaId: '14dab7e3-ff63-49fd-b216-93f0400448fb' },
      { id: '093ee8ef-95f6-411a-aa41-c1ac018b97cb', nombre: 'Viene preparado para aprender', descripcion: 'Evaluación de Viene preparado para aprender', tipo: tipoMap['CASA'], orden: 999, activo: true, materiaId: 'cbbad73d-4bfe-4604-8a83-567debfe20ba' },
      { id: '0dcc16f7-50e3-401b-be4e-a127e22b3302', nombre: 'Responsable en Clase', descripcion: 'Evaluación de Responsable en Clase', tipo: tipoMap['COMPORTAMIENTO'], orden: 999, activo: true, materiaId: '5c9e04b0-2228-495e-9285-e847aa3b3e94' },
      { id: '23f6b4e2-3193-428f-9a27-56dbea8ca65f', nombre: 'MORAL CRISTIANA', descripcion: 'Evaluación de MORAL CRISTIANA', tipo: tipoMap['EXTRACURRICULAR'], orden: 999, activo: true, materiaId: 'cd9b9917-77d9-4d67-ba75-410092b9e3e2' },
      { id: '2e4e7b01-6d1b-4ff1-988e-e3bda4cefe97', nombre: 'Práctica valores morales diariamente', descripcion: 'Evaluación de Práctica valores morales diariamente', tipo: tipoMap['COMPORTAMIENTO'], orden: 999, activo: true, materiaId: 'a8f77675-fd61-4769-9714-0d8b96023bb1' },
      { id: '32006919-16b0-4741-8fa9-f5d15245d510c', nombre: 'ATIENDE JUNTAS DE PADRES', descripcion: 'Evaluación de ATIENDE JUNTAS DE PADRES', tipo: tipoMap['COMPORTAMIENTO'], orden: 999, activo: true, materiaId: 'edd0e07c-9a79-45ac-90a8-cba30704e991' },
      { id: '399e60a7-553c-481f-ae4a-b7714318a95c', nombre: 'Práctica vocabulario de inglés diariamente', descripcion: 'Evaluación de Práctica vocabulario de inglés diariamente', tipo: tipoMap['CASA'], orden: 999, activo: true, materiaId: '01039d20-49bc-4134-bc66-38206474eb87' },
      { id: '3e131179-db74-44c8-bfe2-7578d196218e', nombre: 'Lógica Matemática', descripcion: 'Evaluación de Lógica Matemática', tipo: tipoMap['EXTRACURRICULAR'], orden: 999, activo: true, materiaId: '3a6e9d11-9f5c-496e-8c5f-38d99c18174f' },
      { id: '4e239597-90a0-45a0-bd82-fba001cd46a1', nombre: 'PROGRAMA DE LECTURA', descripcion: 'Evaluación de PROGRAMA DE LECTURA', tipo: tipoMap['EXTRACURRICULAR'], orden: 999, activo: true, materiaId: 'a5b1fce7-0e89-4840-ad80-1f77633a5272' },
      { id: '4f667fb5-68cc-4f41-a7ea-dd168326a5c2', nombre: 'Termina tareas', descripcion: 'Evaluación de Termina tareas', tipo: tipoMap['CASA'], orden: 999, activo: true, materiaId: '11ba16e8-23a1-4ccd-a9f3-0172d95824d1' },
      { id: '58f64a73-1a5c-4499-895c-7469cb822c23', nombre: 'Completa Trabajos a Tiempo', descripcion: 'Evaluación de Completa Trabajos a Tiempo', tipo: tipoMap['COMPORTAMIENTO'], orden: 999, activo: true, materiaId: '39618238-1f77-416b-b9cd-7f61cca7fade' },
      { id: '5c48b707-ca83-4297-b4f7-0e8268c5e7be', nombre: 'INTERACTÚA BIEN CON SUS COMPAÑEROS', descripcion: 'Evaluación de Interactúa bien con sus compañeros', tipo: tipoMap['COMPORTAMIENTO'], orden: 999, activo: true, materiaId: '2e5046a5-4817-4d0e-8473-f088920e90b6' },
      { id: '5fbd1598-2ab8-4a45-a098-a190e36b72d5', nombre: 'Respeta los derechos y propiedades de otros', descripcion: 'Evaluación de Respeta los derechos y propiedades de otros', tipo: tipoMap['COMPORTAMIENTO'], orden: 999, activo: true, materiaId: '7c996399-5538-4ebd-9f02-80db0ef78c9f' },
      { id: '8088cdca-49a0-46f8-853c-3bb4be20e8f4', nombre: 'Demuestra control de sí mismo', descripcion: 'Evaluación de Demuestra control de sí mismo', tipo: tipoMap['COMPORTAMIENTO'], orden: 999, activo: true, materiaId: 'fbc787ec-4c90-4b28-8176-7a1d62299e16' },
      { id: '824ea157-2af1-4e04-a6fd-da3c07937db0', nombre: 'LLEGA A TIEMPO', descripcion: 'Evaluación de LLEGA A TIEMPO', tipo: tipoMap['COMPORTAMIENTO'], orden: 999, activo: true, materiaId: '7e5ad2f9-4307-4ebf-bcbd-33176798cbda' },
      { id: '82fb0e33-fcfb-42fa-9583-b58a6767bd00', nombre: 'RAZONAMIENTO VERBAL', descripcion: 'Evaluación de RAZONAMIENTO VERBAL', tipo: tipoMap['EXTRACURRICULAR'], orden: 999, activo: true, materiaId: '80a02649-7b71-40da-a963-fe26ef0ee048' },
      { id: '8e8a59e7-ef81-43ac-bf1b-c21682b113a0', nombre: 'Práctica diariamente lo estudiado', descripcion: 'Evaluación de Práctica diariamente lo estudiado', tipo: tipoMap['COMPORTAMIENTO'], orden: 999, activo: true, materiaId: '3dab1183-39c0-4de4-aba8-ee191642865c' },
      { id: '950b1aff-9258-4b0e-bcd1-2e6dc0fc4010', nombre: 'Lógica Matemática', descripcion: 'Evaluación de Lógica Matemática', tipo: tipoMap['EXTRACURRICULAR'], orden: 999, activo: true, materiaId: '48a4180b-eea4-4e38-b9f8-f5f148c4037b' },
      { id: '9f358336-2e24-4381-8738-e176fbcbe24b', nombre: 'Práctica Valores Morales diariamente', descripcion: 'Evaluación de Práctica Valores Morales diariamente', tipo: tipoMap['COMPORTAMIENTO'], orden: 999, activo: true, materiaId: '1566c82b-4fce-426d-a024-da20f1c35f0f' },
      { id: 'a8e57b96-7e92-4231-9aec-e58e5f4a1dd6', nombre: 'Interactúa bien con sus compañeros', descripcion: 'Evaluación de Interactúa bien con sus compañeros', tipo: tipoMap['COMPORTAMIENTO'], orden: 999, activo: true, materiaId: 'a2dc524b-eaa8-42cf-9f6d-72ef9ba8bd99' },
      { id: 'b64a3261-0480-4a31-9794-daa42d3e2b63', nombre: 'Moral Cristiana', descripcion: 'Evaluación de Moral Cristiana', tipo: tipoMap['EXTRACURRICULAR'], orden: 999, activo: true, materiaId: '7692f960-c8e6-4d0d-88c9-1162e08b0aff' },
      { id: 'b718fc15-5dc7-48f0-845a-982b5cd64fae', nombre: 'Respeta Autoridad', descripcion: 'Evaluación de Respeta Autoridad', tipo: tipoMap['COMPORTAMIENTO'], orden: 999, activo: true, materiaId: 'f55c7e8e-d2e6-4946-9f4b-c41f64b37cce' },
      { id: 'b7acc63e-e073-44ae-a96c-e50ccecd0f34', nombre: 'RESPETA AUTORIDAD', descripcion: 'Evaluación de RESPETA AUTORIDAD', tipo: tipoMap['COMPORTAMIENTO'], orden: 999, activo: true, materiaId: '4cc25790-08b6-4a7f-ad41-aa2045045896' },
      { id: 'b830fa31-8a33-4a49-8d3c-0991a496f662', nombre: 'TICS', descripcion: 'Evaluación de TICS', tipo: tipoMap['EXTRACURRICULAR'], orden: 999, activo: true, materiaId: '061ef5cc-7f7c-47a8-a149-d3bd323df074' },
      { id: '88b855d4-8284-42a8-940a-50566aa90ec2', nombre: 'Acepta responsabilidad de sus acciones', descripcion: 'Evaluación de Acepta responsabilidad de sus acciones', tipo: tipoMap['COMPORTAMIENTO'], orden: 999, activo: true, materiaId: 'a8551599-9e71-4895-88c6-a984bad43dd1' },
      { id: '8e8a59e7-ef81-43ac-bf1b-c21682b113a0', nombre: 'Práctica diariamente lo estudiado', descripcion: 'Evaluación de Práctica diariamente lo estudiado', tipo: tipoMap['COMPORTAMIENTO'], orden: 999, activo: true, materiaId: 'ba69fc87-e57f-40ae-9254-4629f3495585' },
      { id: '9f358336-2e24-4381-8738-e176fbcbe24b', nombre: 'Práctica Valores Morales diariamente', descripcion: 'Evaluación de Práctica Valores Morales diariamente', tipo: tipoMap['COMPORTAMIENTO'], orden: 999, activo: true, materiaId: 'c6ef15d7-4d11-439d-a16f-c5b218e90542' },
      { id: 'a8e57b96-7e92-4231-9aec-e58e5f4a1dd6', nombre: 'Interactúa bien con sus compañeros', descripcion: 'Evaluación de Interactúa bien con sus compañeros', tipo: tipoMap['COMPORTAMIENTO'], orden: 999, activo: true, materiaId: '2e5046a5-4817-4d0e-8473-f088920e90b6' },
      { id: 'b3f44790-ba6c-4e7a-87fc-c2b5ded944b9', nombre: 'Participa en actividades de aprendizaje', descripcion: 'Evaluación de Participa en actividades de aprendizaje', tipo: tipoMap['COMPORTAMIENTO'], orden: 999, activo: true, materiaId: '85f861a6-3faa-4c93-b779-1678cced8140' },
      { id: 'b64a3261-0480-4a31-9794-daa42d3e2b63', nombre: 'Moral Cristiana', descripcion: 'Evaluación de Moral Cristiana', tipo: tipoMap['EXTRACURRICULAR'], orden: 999, activo: true, materiaId: 'e235740c-a73f-4ab8-9dc2-ade361660d31' },
      { id: 'b718fc15-5dc7-48f0-845a-982b5cd64fae', nombre: 'Respeta Autoridad', descripcion: 'Evaluación de Respeta Autoridad', tipo: tipoMap['COMPORTAMIENTO'], orden: 999, activo: true, materiaId: 'f54e7bd4-dbf4-4c1b-ae5a-6959ac733fe6' },
      { id: 'b7acc63e-e073-44ae-a96c-e50ccecd0f34', nombre: 'RESPETA AUTORIDAD', descripcion: 'Evaluación de RESPETA AUTORIDAD', tipo: tipoMap['COMPORTAMIENTO'], orden: 999, activo: true, materiaId: '88b855d4-8284-42a8-940a-50566aa90ec2' },
      { id: 'b830fa31-8a33-4a49-8d3c-0991a496f662', nombre: 'TICS', descripcion: 'Evaluación de TICS', tipo: tipoMap['EXTRACURRICULAR'], orden: 999, activo: true, materiaId: '06917dfb-2811-4a8f-ab46-88f4aeaed3b7' },
      { id: '88b855d4-8284-42a8-940a-50566aa90ec2', nombre: 'Acepta responsabilidad de sus acciones', descripcion: 'Evaluación de Acepta responsabilidad de sus acciones', tipo: tipoMap['COMPORTAMIENTO'], orden: 999, activo: true, materiaId: '23ca1fde-236d-4325-abd9-44446e1c9124' }
    ];

    console.log(`📊 Procesando ${evaluacionesData.length} evaluaciones...`);

    let creadas = 0;
    let actualizadas = 0;
    let errores = 0;

    for (const [index, evalData] of evaluacionesData.entries()) {
      try {
        // Verificar si ya existe
        const existente = await prisma.evaluacionHabito.findUnique({
          where: { id: evalData.id }
        });

        if (existente) {
          // Actualizar si existe
          await prisma.evaluacionHabito.update({
            where: { id: evalData.id },
            data: {
              nombre: evalData.nombre,
              descripcion: evalData.descripcion,
              tipo: evalData.tipo,
              orden: evalData.orden,
              activo: evalData.activo,
              materiaId: evalData.materiaId
            }
          });
          console.log(`✅ ${index + 1}. Actualizada: ${evalData.nombre}`);
          actualizadas++;
        } else {
          // Crear si no existe
          await prisma.evaluacionHabito.create({
            data: {
              id: evalData.id,
              nombre: evalData.nombre,
              descripcion: evalData.descripcion,
              tipo: evalData.tipo,
              orden: evalData.orden,
              activo: evalData.activo,
              materiaId: evalData.materiaId
            }
          });
          console.log(`✅ ${index + 1}. Creada: ${evalData.nombre}`);
          creadas++;
        }
      } catch (error) {
        console.error(`❌ ${index + 1}. Error con ${evalData.nombre}:`, error.message);
        errores++;
      }
    }

    console.log(`\n📊 Resumen de la importación:`);
    console.log(`✅ Creadas: ${creadas}`);
    console.log(`🔄 Actualizadas: ${actualizadas}`);
    console.log(`❌ Errores: ${errores}`);
    console.log(`📈 Total procesadas: ${creadas + actualizadas}`);

    // Verificar el resultado
    const totalEvaluaciones = await prisma.evaluacionHabito.count();
    console.log(`\n📊 Total de evaluaciones en la base de datos: ${totalEvaluaciones}`);

    console.log('\n✅ Importación completada!');

  } catch (error) {
    console.error('❌ Error durante la importación:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importarEvaluacionesHabitos();
