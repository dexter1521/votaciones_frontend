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

      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Estado del Pleno</div>

            <!-- Info de depuración -->
            <div class="q-mb-md text-caption">
              <q-badge color="blue" label="DEBUG INFO" class="q-mr-sm" />
              <span class="text-grey-7">
                Usuario: <strong>{{ userStore.user?.usuario }}</strong> | 
                Rol: <strong>{{ userStore.user?.rol }}</strong> | 
                Permiso iniciar pleno: <strong :class="userStore.canIniciarPleno ? 'text-green' : 'text-red'">{{ userStore.canIniciarPleno ? 'SÍ ✓' : 'NO ✗' }}</strong> | 
                Estado pleno: <strong :class="plenoStore.plenoActual?.estado === 'pendiente' ? 'text-orange' : 'text-grey'">{{ plenoStore.plenoActual?.estado || 'cargando...' }}</strong>
              </span>
            </div>

            <!-- Alerta si no puede ver el botón -->
            <q-banner v-if="userStore.canIniciarPleno && plenoStore.plenoActual?.estado !== 'pendiente'" 
              class="bg-warning text-white q-mb-md" rounded>
              <template v-slot:avatar>
                <q-icon name="warning" color="white" />
              </template>
              El botón "Tomar Asistencia" solo aparece cuando el pleno está en estado <strong>"pendiente"</strong>. 
              Estado actual: <strong>{{ plenoStore.plenoActual?.estado }}</strong>. 
              Ve a la gestión de plenos para cambiar el estado a "pendiente".
            </q-banner>

            <div class="row items-center q-gutter-md">
              <div>
                <q-chip
                  :color="plenoStore.plenoActual?.estado === 'en_sesion' ? 'green' : plenoStore.plenoActual?.estado === 'pendiente' ? 'orange' : 'grey'"
                  text-color="white" icon="event">
                  {{ plenoStore.plenoActual?.estado || 'No iniciado' }}
                </q-chip>
              </div>

              <q-space />

              <div class="q-gutter-sm">
                <!-- Botón Tomar Asistencia - Visible solo en estado pendiente -->
                <q-btn 
                  v-if="userStore.canIniciarPleno && plenoStore.plenoActual?.estado === 'pendiente'" 
                  color="info"
                  label="Tomar Asistencia" 
                  icon="how_to_reg" 
                  @click="activarModoAsistencia" 
                  :disable="modoAsistencia"
                  size="md" 
                  unelevated
                />

                <!-- Botón Ver/Editar Asistencia - Visible en otros estados -->
                <q-btn 
                  v-if="userStore.canIniciarPleno && plenoStore.plenoActual?.estado !== 'pendiente'" 
                  color="info"
                  label="Ver Asistencia" 
                  icon="how_to_reg" 
                  @click="activarModoAsistencia" 
                  :disable="modoAsistencia"
                  size="md" 
                  outline
                >
                  <q-tooltip>Ver/editar asistencia de magistrados</q-tooltip>
                </q-btn>

                <!-- Botón Iniciar Pleno -->
                <q-btn 
                  v-if="userStore.canIniciarPleno" 
                  color="primary" 
                  label="Iniciar Pleno" 
                  icon="play_arrow"
                  @click="iniciarPleno" 
                  :disable="plenoStore.plenoActual?.estado === 'en_sesion' || !asistenciaTomada"
                  size="md"
                  unelevated
                >
                  <q-tooltip v-if="!asistenciaTomada && plenoStore.plenoActual?.estado === 'pendiente'">
                    Primero debe tomar la asistencia
                  </q-tooltip>
                </q-btn>

                <!-- Botón Ver Resultados -->
                <q-btn 
                  color="secondary" 
                  label="Ver Resultados" 
                  icon="bar_chart"
                  @click="verResultados" 
                  outline
                  size="md" 
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <ListaMagistrados :pleno-id="Number(route.params.id)" :modo-asistencia="modoAsistencia"
          @asistencia-guardada="onAsistenciaGuardada" />
      </div>

      <div class="col-12 col-md-8">
        <PuntosOrdenDia :pleno-id="Number(route.params.id)" />
      </div>

    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
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

const modoAsistencia = ref(false);
const asistenciaTomada = ref(false);

const activarModoAsistencia = () => {
  modoAsistencia.value = true;
  $q.notify({
    type: 'info',
    message: 'Marque la asistencia de cada magistrado',
    position: 'top'
  });
};

const onAsistenciaGuardada = () => {
  modoAsistencia.value = false;
  asistenciaTomada.value = true;
  $q.notify({
    type: 'positive',
    message: 'Asistencia registrada. Ahora puede iniciar el pleno',
    position: 'top'
  });
};

onMounted(async () => {
  const plenoId = Number(route.params.id);
  await plenoStore.cargarPleno(plenoId);

  // Conectar socket y escuchar eventos del pleno
  socket.connect();
  socket.emit('join_pleno', plenoId);

  socket.on('pleno_actualizado', (data) => {
    plenoStore.sincronizarPleno(data);
  });
});

onUnmounted(() => {
  socket.emit('leave_pleno', Number(route.params.id));
  socket.off('pleno_actualizado');
});

const iniciarPleno = async () => {
  try {
    await plenoStore.iniciarPleno(Number(route.params.id));
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
