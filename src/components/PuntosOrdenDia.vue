<template>
  <q-card>
    <q-card-section>
      <div class="text-h6 q-mb-md">
        <q-icon name="list" color="primary" size="sm" class="q-mr-sm" />
        Puntos del Orden del Día
      </div>
      <q-separator class="q-mb-md" />

      <q-list separator>
        <q-item
          v-for="(punto, index) in puntos"
          :key="punto.id"
          :class="['punto-item', { 'punto-activo': punto.activo, 'punto-completado': punto.completado }]"
          clickable
          @click="seleccionarPunto(punto)"
        >
          <q-item-section avatar>
            <q-avatar :color="getPuntoColor(punto)" text-color="white">
              {{ index + 1 }}
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-weight-medium">
              {{ punto.titulo }}
            </q-item-label>
            <q-item-label caption lines="2">
              {{ punto.descripcion }}
            </q-item-label>
            <q-item-label caption class="q-mt-xs">
              <q-icon name="schedule" size="xs" /> {{ punto.tiempo_estimado }} min
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <div class="column items-end">
              <q-badge
                v-if="punto.completado"
                color="positive"
                icon="check_circle"
                label="Completado"
              />
              <q-badge
                v-else-if="punto.activo"
                color="primary"
                icon="play_circle"
                label="En curso"
              />
              <q-badge
                v-else
                color="grey"
                icon="pending"
                label="Pendiente"
              />

              <q-btn
                v-if="punto.tiene_votacion"
                flat
                dense
                round
                color="primary"
                icon="how_to_vote"
                size="sm"
                class="q-mt-xs"
                @click.stop="iniciarVotacion(punto)"
              >
                <q-tooltip>Iniciar votación</q-tooltip>
              </q-btn>
            </div>
          </q-item-section>
        </q-item>

        <q-item v-if="!puntos || puntos.length === 0">
          <q-item-section>
            <q-item-label class="text-grey-6 text-center">
              No hay puntos en el orden del día
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>

    <q-card-section class="q-pt-none">
      <q-separator class="q-mb-md" />
      <div class="progreso-container">
        <div class="text-caption text-grey-7 q-mb-xs">
          Progreso: {{ puntosCompletados }} de {{ puntos.length }} puntos completados
        </div>
        <q-linear-progress
          :value="progreso"
          color="primary"
          size="20px"
          class="rounded-borders"
        >
          <div class="absolute-full flex flex-center">
            <q-badge color="white" text-color="primary" :label="`${Math.round(progreso * 100)}%`" />
          </div>
        </q-linear-progress>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';

const router = useRouter();
const $q = useQuasar();

const puntos = ref([]);

const puntosCompletados = computed(() => {
  return puntos.value.filter(p => p.completado).length;
});

const progreso = computed(() => {
  if (puntos.value.length === 0) return 0;
  return puntosCompletados.value / puntos.value.length;
});

const getPuntoColor = (punto) => {
  if (punto.completado) return 'positive';
  if (punto.activo) return 'primary';
  return 'grey';
};

const cargarPuntos = async () => {
  try {
    const response = await api.get('/puntos-orden-dia');
    puntos.value = response.data;
  } catch (error) {
    console.error('Error al cargar puntos:', error);
  }
};

const seleccionarPunto = (punto) => {
  $q.notify({
    type: 'info',
    message: `Punto seleccionado: ${punto.titulo}`,
    position: 'top'
  });
};

const iniciarVotacion = (punto) => {
  if (punto.votacion_id) {
    router.push(`/votacion/${punto.votacion_id}`);
  } else {
    $q.dialog({
      title: 'Crear Votación',
      message: `¿Desea crear una votación para el punto: ${punto.titulo}?`,
      cancel: true,
      persistent: true
    }).onOk(async () => {
      try {
        const response = await api.post('/votaciones', {
          punto_id: punto.id,
          titulo: punto.titulo,
          descripcion: punto.descripcion
        });
        router.push(`/votacion/${response.data.id}`);
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'Error al crear votación',
          position: 'top'
        });
      }
    });
  }
};

onMounted(() => {
  cargarPuntos();
});
</script>

<style scoped lang="scss">
.punto-item {
  border-left: 3px solid transparent;
  transition: all 0.3s;

  &:hover {
    background-color: #f5f5f5;
  }

  &.punto-activo {
    border-left-color: #667eea;
    background-color: #f0f0ff;
  }

  &.punto-completado {
    border-left-color: #21ba45;
    opacity: 0.8;
  }
}

.progreso-container {
  padding: 12px;
  background: #f5f5f5;
  border-radius: 8px;
}

.rounded-borders {
  border-radius: 10px;
  overflow: hidden;
}
</style>
