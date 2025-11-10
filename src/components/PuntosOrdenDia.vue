<template>
  <q-card>
    <q-card-section>
      <div class="row items-center q-mb-md">
        <div class="col">
          <div class="text-h6">
            <q-icon name="list" color="primary" size="sm" class="q-mr-sm" />
            Puntos del Orden del Día
          </div>
        </div>
        <div class="col-auto">
          <q-btn color="primary" icon="add" label="Nuevo Punto" size="sm" @click="mostrarDialogCrear"
            :disable="!plenoId || isNaN(plenoId)" />
        </div>
      </div>
      <q-separator class="q-mb-md" />

      <q-list separator>
        <q-item v-for="(punto, index) in puntos" :key="punto.id"
          :class="['punto-item', { 'punto-activo': punto.activo, 'punto-completado': punto.completado }]" clickable
          @click="seleccionarPunto(punto)">
          <q-item-section avatar>
            <q-avatar :color="getPuntoColor(punto)" text-color="white">
              {{ index + 1 }}
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-weight-medium">
              Punto {{ punto.orden + 1 }}
            </q-item-label>
            <q-item-label caption lines="2">
              {{ punto.descripcion }}
            </q-item-label>
            <q-item-label caption class="q-mt-xs">
              <q-icon :name="punto.habilitado ? 'check_circle' : 'cancel'" size="xs" />
              {{ punto.habilitado ? 'Habilitado' : 'Deshabilitado' }}
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <div class="column items-end q-gutter-xs">
              <q-badge :color="getEstadoBadgeColor(punto.estado)" :label="punto.estado" />

              <div class="row q-gutter-xs">
                <q-btn flat dense round color="secondary" icon="edit" size="sm" @click.stop="editarPunto(punto)">
                  <q-tooltip>Editar</q-tooltip>
                </q-btn>
                <q-btn flat dense round color="negative" icon="delete" size="sm" @click.stop="confirmarEliminar(punto)">
                  <q-tooltip>Eliminar</q-tooltip>
                </q-btn>
                <q-btn flat dense round color="primary" icon="how_to_vote" size="sm"
                  @click.stop="iniciarVotacion(punto)">
                  <q-tooltip>Iniciar votación</q-tooltip>
                </q-btn>
              </div>
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
        <q-linear-progress :value="progreso" color="primary" size="20px" class="rounded-borders">
          <div class="absolute-full flex flex-center">
            <q-badge color="white" text-color="primary" :label="`${Math.round(progreso * 100)}%`" />
          </div>
        </q-linear-progress>
      </div>
    </q-card-section>

    <!-- Dialog Crear/Editar Punto -->
    <q-dialog v-model="dialogPunto" persistent>
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">{{ modoEdicion ? 'Editar Punto' : 'Nuevo Punto' }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit="guardarPunto" class="q-gutter-md">
            <q-input v-model="formPunto.descripcion" label="Descripción del Punto" filled type="textarea" rows="3"
              :rules="[val => !!val || 'La descripción es requerida']" />

            <q-input v-model.number="formPunto.orden" label="Orden" type="number" filled
              :rules="[val => val >= 0 || 'El orden debe ser mayor o igual a 0']" />

            <q-select v-model="formPunto.estado" :options="estadosPunto" label="Estado" filled emit-value map-options
              :rules="[val => !!val || 'El estado es requerido']" />

            <q-toggle v-model="formPunto.habilitado" label="Habilitado" color="primary" />

            <div class="row q-gutter-sm justify-end">
              <q-btn flat label="Cancelar" color="grey" @click="cerrarDialog" />
              <q-btn type="submit" label="Guardar" color="primary" :loading="guardando" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
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
const dialogPunto = ref(false);
const modoEdicion = ref(false);
const guardando = ref(false);
const puntoEditando = ref(null);

const formPunto = ref({
  descripcion: '',
  orden: 0,
  habilitado: false,
  estado: 'pendiente'
});

const estadosPunto = [
  { label: 'Pendiente', value: 'pendiente' },
  { label: 'En Curso', value: 'en_curso' },
  { label: 'Completado', value: 'completado' }
];

const puntosCompletados = computed(() => {
  return puntos.value.filter(p => p.estado === 'completado').length;
});

const progreso = computed(() => {
  if (puntos.value.length === 0) return 0;
  return puntosCompletados.value / puntos.value.length;
});

const getPuntoColor = (punto) => {
  if (punto.estado === 'completado') return 'positive';
  if (punto.estado === 'en_curso') return 'primary';
  return 'grey';
};

const getEstadoBadgeColor = (estado) => {
  const colores = {
    pendiente: 'grey',
    en_curso: 'primary',
    completado: 'positive'
  };
  return colores[estado] || 'grey';
};

const props = defineProps({
  plenoId: {
    type: Number,
    required: true
  }
});

const cargarPuntos = async () => {
  if (!props.plenoId || isNaN(props.plenoId)) {
    console.warn('ID de pleno inválido:', props.plenoId);
    return;
  }

  try {
    const response = await api.get('/puntos', {
      params: { id_pleno: props.plenoId }
    });
    puntos.value = response.data;
  } catch (error) {
    console.error('Error al cargar puntos:', error);
  }
};

const mostrarDialogCrear = () => {
  modoEdicion.value = false;
  puntoEditando.value = null;
  formPunto.value = {
    descripcion: '',
    orden: puntos.value.length,
    habilitado: false,
    estado: 'pendiente'
  };
  dialogPunto.value = true;
};

const editarPunto = (punto) => {
  modoEdicion.value = true;
  puntoEditando.value = { ...punto };
  formPunto.value = {
    descripcion: punto.descripcion,
    orden: punto.orden,
    habilitado: punto.habilitado,
    estado: punto.estado
  };
  dialogPunto.value = true;
};

const guardarPunto = async () => {
  if (!props.plenoId || isNaN(props.plenoId)) {
    $q.notify({
      type: 'negative',
      message: 'ID de pleno inválido',
      position: 'top'
    });
    return;
  }

  guardando.value = true;
  try {
    if (modoEdicion.value) {
      const puntoId = Number(puntoEditando.value.id_punto);
      await api.patch(`/puntos/${puntoId}`, formPunto.value);
      $q.notify({
        type: 'positive',
        message: 'Punto actualizado correctamente',
        position: 'top'
      });
    } else {
      const puntoData = {
        ...formPunto.value,
        id_pleno: Number(props.plenoId)
      };
      console.log('Enviando punto:', puntoData);
      await api.post('/puntos', puntoData);
      $q.notify({
        type: 'positive',
        message: 'Punto creado correctamente',
        position: 'top'
      });
    }
    cerrarDialog();
    await cargarPuntos();
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Error al guardar el punto',
      position: 'top'
    });
  } finally {
    guardando.value = false;
  }
};

const confirmarEliminar = (punto) => {
  $q.dialog({
    title: 'Confirmar Eliminación',
    message: `¿Está seguro de eliminar este punto?`,
    cancel: true,
    persistent: true,
    color: 'negative'
  }).onOk(async () => {
    try {
      await api.delete(`/puntos/${Number(punto.id_punto)}`);
      $q.notify({
        type: 'positive',
        message: 'Punto eliminado correctamente',
        position: 'top'
      });
      await cargarPuntos();
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: error.response?.data?.message || 'Error al eliminar el punto',
        position: 'top'
      });
    }
  });
};

const cerrarDialog = () => {
  dialogPunto.value = false;
  formPunto.value = {
    descripcion: '',
    orden: 0,
    habilitado: false,
    estado: 'pendiente'
  };
};

const seleccionarPunto = (punto) => {
  $q.notify({
    type: 'info',
    message: `Punto ${punto.orden + 1} seleccionado`,
    position: 'top'
  });
};

const iniciarVotacion = (punto) => {
  $q.notify({
    type: 'info',
    message: 'Función de votación en desarrollo',
    position: 'top'
  });
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
