<template>
  <q-card>
    <q-card-section>
      <div class="text-h6 q-mb-md">
        <q-icon name="people" color="primary" size="sm" class="q-mr-sm" />
        Lista de Magistrados
      </div>
      <q-separator class="q-mb-md" />
      
      <q-list separator>
        <q-item
          v-for="magistrado in magistrados"
          :key="magistrado.id"
          class="magistrado-item"
        >
          <q-item-section avatar>
            <q-avatar :color="getEstadoColor(magistrado.conectado)" text-color="white">
              <q-icon :name="magistrado.conectado ? 'person' : 'person_outline'" />
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label>{{ magistrado.nombre }}</q-item-label>
            <q-item-label caption>{{ magistrado.cargo }}</q-item-label>
          </q-item-section>

          <q-item-section side>
            <div class="column items-end">
              <q-badge
                :color="getEstadoColor(magistrado.conectado)"
                :label="magistrado.conectado ? 'En línea' : 'Offline'"
              />
              <q-badge
                v-if="magistrado.ha_votado"
                color="positive"
                label="Votó"
                class="q-mt-xs"
              />
            </div>
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
        <div class="col-4">
          <div class="stat-mini">
            <div class="stat-value">{{ magistradosConectados }}</div>
            <div class="stat-label">Conectados</div>
          </div>
        </div>
        <div class="col-4">
          <div class="stat-mini">
            <div class="stat-value">{{ magistradosVotaron }}</div>
            <div class="stat-label">Han votado</div>
          </div>
        </div>
        <div class="col-4">
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

const magistrados = ref([]);

const magistradosConectados = computed(() => {
  return magistrados.value.filter(m => m.conectado).length;
});

const magistradosVotaron = computed(() => {
  return magistrados.value.filter(m => m.ha_votado).length;
});

const getEstadoColor = (conectado) => {
  return conectado ? 'positive' : 'grey';
};

const cargarMagistrados = async () => {
  try {
    const response = await api.get('/magistrados');
    magistrados.value = response.data;
  } catch (error) {
    console.error('Error al cargar magistrados:', error);
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
