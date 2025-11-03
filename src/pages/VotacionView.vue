<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h5">{{ votoStore.votacionActual?.titulo }}</div>
            <div class="text-subtitle2 text-grey-7">
              Punto {{ votoStore.votacionActual?.numero_punto }} - 
              {{ votoStore.votacionActual?.tipo }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12">
        <PanelVotacion />
      </div>

      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Descripción</div>
            <p>{{ votoStore.votacionActual?.descripcion }}</p>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Estado de Votación</div>
            <div class="votacion-estado">
              <div class="estado-item">
                <q-icon name="thumb_up" color="green" size="md" />
                <div class="estado-label">A favor</div>
                <div class="estado-count">{{ votoStore.conteoVotos.a_favor }}</div>
              </div>
              <div class="estado-item">
                <q-icon name="thumb_down" color="red" size="md" />
                <div class="estado-label">En contra</div>
                <div class="estado-count">{{ votoStore.conteoVotos.en_contra }}</div>
              </div>
              <div class="estado-item">
                <q-icon name="remove" color="orange" size="md" />
                <div class="estado-label">Abstención</div>
                <div class="estado-count">{{ votoStore.conteoVotos.abstencion }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="flex justify-between items-center">
              <q-chip
                :color="votoStore.votacionActual?.estado === 'en_curso' ? 'green' : 'grey'"
                text-color="white"
                icon="how_to_vote"
              >
                {{ votoStore.votacionActual?.estado || 'No iniciado' }}
              </q-chip>
              <div class="q-gutter-sm">
                <q-btn
                  v-if="userStore.canIniciarVotacion"
                  color="primary"
                  label="Iniciar Votación"
                  @click="iniciarVotacion"
                  :disable="votoStore.votacionActual?.estado === 'en_curso'"
                />
                <q-btn
                  v-if="userStore.canCerrarVotacion"
                  color="negative"
                  label="Cerrar Votación"
                  @click="cerrarVotacion"
                  :disable="votoStore.votacionActual?.estado !== 'en_curso'"
                />
                <q-btn
                  color="secondary"
                  label="Ver Resultados"
                  @click="verResultados"
                  outline
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useVotoStore } from 'stores/votoStore';
import { useUserStore } from 'stores/userStore';
import PanelVotacion from 'components/PanelVotacion.vue';
import { socket } from 'boot/socket.io';

const route = useRoute();
const router = useRouter();
const $q = useQuasar();
const votoStore = useVotoStore();
const userStore = useUserStore();

onMounted(async () => {
  const votacionId = route.params.id;
  await votoStore.cargarVotacion(votacionId);
  
  // Escuchar votos en tiempo real
  socket.on('voto_registrado', (data) => {
    votoStore.actualizarVoto(data);
  });
  
  socket.on('votacion_cerrada', (data) => {
    votoStore.cerrarVotacion(data);
    $q.notify({
      type: 'info',
      message: 'La votación ha sido cerrada',
      position: 'top'
    });
  });
});

onUnmounted(() => {
  socket.off('voto_registrado');
  socket.off('votacion_cerrada');
});

const iniciarVotacion = async () => {
  try {
    await votoStore.iniciarVotacion(route.params.id);
    $q.notify({
      type: 'positive',
      message: 'Votación iniciada correctamente',
      position: 'top'
    });
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Error al iniciar la votación',
      position: 'top'
    });
  }
};

const cerrarVotacion = async () => {
  try {
    await votoStore.cerrarVotacion(route.params.id);
    $q.notify({
      type: 'positive',
      message: 'Votación cerrada correctamente',
      position: 'top'
    });
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Error al cerrar la votación',
      position: 'top'
    });
  }
};

const verResultados = () => {
  router.push(`/resultados/${route.params.id}`);
};
</script>

<style scoped lang="scss">
.votacion-estado {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  text-align: center;
}

.estado-item {
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
}

.estado-label {
  font-size: 14px;
  color: #666;
  margin-top: 8px;
}

.estado-count {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin-top: 4px;
}
</style>
