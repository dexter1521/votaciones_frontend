<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h5">{{ plenoStore.plenoActual?.nombre }}</div>
            <div class="text-subtitle2 text-grey-7">
              {{ plenoStore.plenoActual?.fecha }} - Sala {{ plenoStore.plenoActual?.sala }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <ListaMagistrados />
      </div>

      <div class="col-12 col-md-8">
        <PuntosOrdenDia />
      </div>

      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Estado del Pleno</div>
            <div class="flex justify-between items-center">
              <div>
                <q-chip
                  :color="plenoStore.plenoActual?.estado === 'en_curso' ? 'green' : 'grey'"
                  text-color="white"
                  icon="event"
                >
                  {{ plenoStore.plenoActual?.estado || 'No iniciado' }}
                </q-chip>
              </div>
              <div class="q-gutter-sm">
                <q-btn
                  v-if="userStore.canIniciarPleno"
                  color="primary"
                  label="Iniciar Pleno"
                  @click="iniciarPleno"
                  :disable="plenoStore.plenoActual?.estado === 'en_curso'"
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
import { usePlenoStore } from 'stores/plenoStore';
import { useUserStore } from 'stores/userStore';
import ListaMagistrados from 'components/ListaMagistrados.vue';
import PuntosOrdenDia from 'components/PuntosOrdenDia.vue';
import { socket } from 'boot/socket.io';

const route = useRoute();
const router = useRouter();
const $q = useQuasar();
const plenoStore = usePlenoStore();
const userStore = useUserStore();

onMounted(async () => {
  const plenoId = route.params.id;
  await plenoStore.cargarPleno(plenoId);
  
  // Conectar socket y escuchar eventos del pleno
  socket.connect();
  socket.emit('join_pleno', plenoId);
  
  socket.on('pleno_actualizado', (data) => {
    plenoStore.actualizarPleno(data);
  });
});

onUnmounted(() => {
  socket.emit('leave_pleno', route.params.id);
  socket.off('pleno_actualizado');
});

const iniciarPleno = async () => {
  try {
    await plenoStore.iniciarPleno(route.params.id);
    $q.notify({
      type: 'positive',
      message: 'Pleno iniciado correctamente',
      position: 'top'
    });
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Error al iniciar el pleno',
      position: 'top'
    });
  }
};

const verResultados = () => {
  router.push(`/resultados/${route.params.id}`);
};
</script>
