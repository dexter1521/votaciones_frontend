<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h5">Resultados de Votaciones</div>
            <div class="text-subtitle2 text-grey-7">
              {{ plenoStore.plenoActual?.nombre }} - {{ plenoStore.plenoActual?.fecha }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="flex justify-between items-center q-mb-md">
              <div class="text-h6">Resumen de Votaciones</div>
              <div class="q-gutter-sm">
                <q-btn
                  color="primary"
                  label="Exportar PDF"
                  icon="picture_as_pdf"
                  @click="exportarPDF"
                  outline
                />
                <q-btn
                  color="green"
                  label="Exportar Excel"
                  icon="table_chart"
                  @click="exportarExcel"
                  outline
                />
              </div>
            </div>
            <ResultadosTabla />
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Resumen General</div>
            <div class="resumen-grid">
              <div class="resumen-item">
                <div class="resumen-value">{{ estadisticas.total_votaciones }}</div>
                <div class="resumen-label">Total Votaciones</div>
              </div>
              <div class="resumen-item">
                <div class="resumen-value">{{ estadisticas.aprobadas }}</div>
                <div class="resumen-label">Aprobadas</div>
              </div>
              <div class="resumen-item">
                <div class="resumen-value">{{ estadisticas.rechazadas }}</div>
                <div class="resumen-label">Rechazadas</div>
              </div>
              <div class="resumen-item">
                <div class="resumen-value">{{ estadisticas.en_proceso }}</div>
                <div class="resumen-label">En Proceso</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Participación</div>
            <div class="participacion-info">
              <q-circular-progress
                show-value
                :value="porcentajeParticipacion"
                size="150px"
                :thickness="0.15"
                color="primary"
                track-color="grey-3"
              >
                <div class="text-h6">{{ porcentajeParticipacion }}%</div>
              </q-circular-progress>
              <div class="participacion-detalles q-mt-md">
                <div>Magistrados que votaron: {{ estadisticas.magistrados_votaron }}</div>
                <div>Total magistrados: {{ estadisticas.total_magistrados }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { usePlenoStore } from 'stores/plenoStore';
import ResultadosTabla from 'components/ResultadosTabla.vue';

const route = useRoute();
const $q = useQuasar();
const plenoStore = usePlenoStore();

const estadisticas = ref({
  total_votaciones: 0,
  aprobadas: 0,
  rechazadas: 0,
  en_proceso: 0,
  magistrados_votaron: 0,
  total_magistrados: 0
});

const porcentajeParticipacion = computed(() => {
  if (estadisticas.value.total_magistrados === 0) return 0;
  return Math.round((estadisticas.value.magistrados_votaron / estadisticas.value.total_magistrados) * 100);
});

onMounted(async () => {
  const plenoId = route.params.id;
  await plenoStore.cargarResultados(plenoId);
  
  // Cargar estadísticas
  estadisticas.value = {
    total_votaciones: 8,
    aprobadas: 5,
    rechazadas: 2,
    en_proceso: 1,
    magistrados_votaron: 10,
    total_magistrados: 12
  };
});

const exportarPDF = () => {
  $q.notify({
    type: 'info',
    message: 'Generando PDF...',
    position: 'top'
  });
  // Lógica para exportar PDF
};

const exportarExcel = () => {
  $q.notify({
    type: 'info',
    message: 'Generando Excel...',
    position: 'top'
  });
  // Lógica para exportar Excel
};
</script>

<style scoped lang="scss">
.resumen-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  text-align: center;
}

.resumen-item {
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
}

.resumen-value {
  font-size: 32px;
  font-weight: bold;
  color: #667eea;
}

.resumen-label {
  font-size: 14px;
  color: #666;
  margin-top: 8px;
}

.participacion-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.participacion-detalles {
  font-size: 14px;
  color: #666;
  line-height: 1.8;
}
</style>
