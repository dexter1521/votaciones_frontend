<template>
  <q-card>
    <q-card-section>
      <div class="row items-center q-mb-md">
        <div class="col">
          <div class="text-h6">
            <q-icon name="people" color="primary" size="sm" class="q-mr-sm" />
            Lista de Magistrados
          </div>
        </div>
        <div class="col-auto" v-if="modoAsistencia">
          <q-btn color="positive" icon="check_circle" label="Guardar Asistencia" size="sm" @click="guardarAsistencia"
            :loading="guardando" />
        </div>
      </div>
      <q-separator class="q-mb-md" />

      <q-list separator>
        <q-item v-for="magistrado in magistrados" :key="magistrado.id" class="magistrado-item">
          <q-item-section avatar>
            <q-avatar :color="getEstadoColor(magistrado.conectado)" text-color="white">
              <q-icon :name="magistrado.conectado ? 'person' : 'person_outline'" />
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label>{{ magistrado.nombre }}</q-item-label>
            <q-item-label caption>{{ magistrado.cargo }}</q-item-label>
          </q-item-section>

          <q-item-section side v-if="!modoAsistencia">
            <div class="column items-end">
              <q-badge :color="getEstadoColor(magistrado.conectado)"
                :label="magistrado.conectado ? 'En línea' : 'Offline'" />
              <q-badge v-if="magistrado.ha_votado" color="positive" label="Votó" class="q-mt-xs" />
              <q-badge v-if="magistrado.tipo_asistencia === 'presencial'" color="green" label="Presencial"
                class="q-mt-xs" />
              <q-badge v-if="magistrado.tipo_asistencia === 'remoto'" color="blue" label="Remoto" class="q-mt-xs" />
              <q-badge v-if="magistrado.tipo_asistencia === 'ausente'" color="grey" label="Ausente" class="q-mt-xs" />
            </div>
          </q-item-section>

          <q-item-section side v-if="modoAsistencia">
            <q-btn-group>
              <q-btn :color="magistrado.tipo_asistencia === 'presencial' ? 'positive' : 'grey-5'" label="Presencial"
                size="sm" @click="cambiarAsistencia(magistrado, 'presencial')" />
              <q-btn :color="magistrado.tipo_asistencia === 'remoto' ? 'info' : 'grey-5'" label="Remoto" size="sm"
                @click="cambiarAsistencia(magistrado, 'remoto')" />
              <q-btn :color="magistrado.tipo_asistencia === 'ausente' ? 'grey' : 'grey-5'" label="Ausente" size="sm"
                @click="cambiarAsistencia(magistrado, 'ausente')" />
            </q-btn-group>
          </q-item-section>
        </q-item>

        <q-item v-if="!magistrados || magistrados.length === 0">
          <q-item-section>
            <q-item-label class="text-grey-6 text-center">
              No hay magistrados registrados
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>

    <q-card-section class="q-pt-none">
      <q-separator class="q-mb-md" />
      <div class="row q-col-gutter-sm text-center">
        <div class="col-3">
          <div class="stat-mini">
            <div class="stat-value">{{ magistradosPresentes }}</div>
            <div class="stat-label">Presentes</div>
          </div>
        </div>
        <div class="col-3">
          <div class="stat-mini">
            <div class="stat-value">{{ magistradosConectados }}</div>
            <div class="stat-label">Conectados</div>
          </div>
        </div>
        <div class="col-3">
          <div class="stat-mini">
            <div class="stat-value">{{ magistradosVotaron }}</div>
            <div class="stat-label">Han votado</div>
          </div>
        </div>
        <div class="col-3">
          <div class="stat-mini">
            <div class="stat-value">{{ magistrados.length }}</div>
            <div class="stat-label">Total</div>
          </div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { api } from 'boot/axios';
import { socket } from 'boot/socket.io';
import { useQuasar } from 'quasar';

const props = defineProps({
  plenoId: {
    type: [Number, String],
    required: true
  },
  modoAsistencia: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['asistencia-guardada']);

const $q = useQuasar();
const magistrados = ref([]);
const guardando = ref(false);

const magistradosConectados = computed(() => {
  return magistrados.value.filter(m => m.conectado).length;
});

const magistradosVotaron = computed(() => {
  return magistrados.value.filter(m => m.ha_votado).length;
});

const magistradosPresentes = computed(() => {
  return magistrados.value.filter(m => m.tipo_asistencia === 'presencial' || m.tipo_asistencia === 'remoto').length;
});

const getEstadoColor = (conectado) => {
  return conectado ? 'positive' : 'grey';
};

const cambiarAsistencia = (magistrado, tipo) => {
  magistrado.tipo_asistencia = tipo;
};

const cargarMagistrados = async () => {
  try {
    const response = await api.get('/magistrados');
    // Mapear los datos del backend al formato esperado
    magistrados.value = response.data.map(m => ({
      ...m,
      id: m.id_magistrado || m.id,
      nombre: m.nombre_completo,
      conectado: false,
      ha_votado: false,
      tipo_asistencia: null // presencial, remoto, ausente
    }));

    // Si estamos en modo vista (no asistencia), cargar la asistencia guardada
    if (!props.modoAsistencia && props.plenoId) {
      await cargarAsistencia();
    }
  } catch (error) {
    console.error('Error al cargar magistrados:', error);
  }
};

const cargarAsistencia = async () => {
  try {
    const response = await api.get('/asistencias');
    // Filtrar solo las asistencias de este pleno
    const asistenciasPleno = response.data.filter(a => a.id_pleno === Number(props.plenoId));

    // Actualizar tipo_asistencia de cada magistrado según lo guardado
    asistenciasPleno.forEach(asistencia => {
      const magistrado = magistrados.value.find(m => m.id === asistencia.id_magistrado);
      if (magistrado) {
        magistrado.tipo_asistencia = asistencia.tipo_asistencia;
      }
    });
  } catch (error) {
    console.error('Error al cargar asistencia:', error);
  }
};

const guardarAsistencia = async () => {
  try {
    guardando.value = true;

    // Filtrar magistrados con asistencia marcada
    const magistradosConAsistencia = magistrados.value.filter(m => m.tipo_asistencia);

    if (magistradosConAsistencia.length === 0) {
      $q.notify({
        type: 'warning',
        message: 'Debe marcar la asistencia de al menos un magistrado'
      });
      return;
    }

    // Enviar cada asistencia individualmente según el endpoint POST /asistencias
    const promesas = magistradosConAsistencia.map(m =>
      api.post('/asistencias', {
        id_pleno: Number(props.plenoId),
        id_magistrado: m.id,
        tipo_asistencia: m.tipo_asistencia
      })
    );

    await Promise.all(promesas);

    $q.notify({
      type: 'positive',
      message: `Asistencia de ${magistradosConAsistencia.length} magistrado(s) guardada exitosamente`
    });

    emit('asistencia-guardada');
  } catch (error) {
    console.error('Error al guardar asistencia:', error);
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Error al guardar la asistencia'
    });
  } finally {
    guardando.value = false;
  }
};

onMounted(() => {
  cargarMagistrados();

  // Escuchar eventos de conexión/desconexión de magistrados
  socket.on('magistrado_conectado', (data) => {
    const magistrado = magistrados.value.find(m => m.id === data.magistrado_id);
    if (magistrado) {
      magistrado.conectado = true;
    }
  });

  socket.on('magistrado_desconectado', (data) => {
    const magistrado = magistrados.value.find(m => m.id === data.magistrado_id);
    if (magistrado) {
      magistrado.conectado = false;
    }
  });

  socket.on('voto_registrado', (data) => {
    const magistrado = magistrados.value.find(m => m.id === data.magistrado_id);
    if (magistrado) {
      magistrado.ha_votado = true;
    }
  });
});

onUnmounted(() => {
  socket.off('magistrado_conectado');
  socket.off('magistrado_desconectado');
  socket.off('voto_registrado');
});
</script>

<style scoped lang="scss">
.magistrado-item {
  border-left: 3px solid transparent;
  transition: all 0.3s;

  &:hover {
    background-color: #f5f5f5;
    border-left-color: #667eea;
  }
}

.stat-mini {
  padding: 12px;
  background: #f5f5f5;
  border-radius: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #667eea;
}

.stat-label {
  font-size: 11px;
  color: #666;
  margin-top: 4px;
}
</style>
