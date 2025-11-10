<template>
  <q-card>
    <q-card-section>
      <div class="flex justify-between items-center q-mb-md">
        <div class="text-h6">Tabla de Resultados</div>
        <q-btn-group outline>
          <q-btn icon="refresh" label="Actualizar" color="primary" @click="cargarResultados" :loading="loading" />
          <q-btn icon="filter_list" label="Filtros" color="primary" @click="mostrarFiltros = !mostrarFiltros" />
        </q-btn-group>
      </div>

      <div v-if="mostrarFiltros" class="filtros-panel q-mb-md">
        <div class="row q-col-gutter-sm">
          <div class="col-12 col-md-4">
            <q-select v-model="filtroEstado" :options="opcionesEstado" label="Estado" filled dense clearable />
          </div>
          <div class="col-12 col-md-4">
            <q-select v-model="filtroResultado" :options="opcionesResultado" label="Resultado" filled dense clearable />
          </div>
          <div class="col-12 col-md-4">
            <q-input v-model="filtroBusqueda" label="Buscar" filled dense clearable>
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
        </div>
      </div>

      <q-table :rows="resultadosFiltrados" :columns="columns" row-key="id" :loading="loading" :pagination="pagination"
        flat bordered class="resultados-table">
        <template v-slot:body-cell-numero="props">
          <q-td :props="props">
            <q-badge color="primary" :label="props.row.numero" />
          </q-td>
        </template>

        <template v-slot:body-cell-titulo="props">
          <q-td :props="props">
            <div class="text-weight-medium">{{ props.row.titulo }}</div>
            <div class="text-caption text-grey-7">{{ props.row.descripcion }}</div>
          </q-td>
        </template>

        <template v-slot:body-cell-a_favor="props">
          <q-td :props="props" class="text-center">
            <q-chip color="positive" text-color="white" dense>
              <q-icon name="thumb_up" size="xs" class="q-mr-xs" />
              {{ props.row.a_favor }}
            </q-chip>
          </q-td>
        </template>

        <template v-slot:body-cell-en_contra="props">
          <q-td :props="props" class="text-center">
            <q-chip color="negative" text-color="white" dense>
              <q-icon name="thumb_down" size="xs" class="q-mr-xs" />
              {{ props.row.en_contra }}
            </q-chip>
          </q-td>
        </template>

        <template v-slot:body-cell-abstencion="props">
          <q-td :props="props" class="text-center">
            <q-chip color="warning" text-color="white" dense>
              <q-icon name="remove" size="xs" class="q-mr-xs" />
              {{ props.row.abstencion }}
            </q-chip>
          </q-td>
        </template>

        <template v-slot:body-cell-resultado="props">
          <q-td :props="props">
            <q-badge :color="getResultadoColor(props.row.resultado)" :label="props.row.resultado" />
          </q-td>
        </template>

        <template v-slot:body-cell-estado="props">
          <q-td :props="props">
            <q-badge :color="getEstadoColor(props.row.estado)" :label="props.row.estado" />
          </q-td>
        </template>

        <template v-slot:body-cell-acciones="props">
          <q-td :props="props">
            <q-btn flat dense round icon="visibility" color="primary" size="sm" @click="verDetalle(props.row)">
              <q-tooltip>Ver detalle</q-tooltip>
            </q-btn>
            <q-btn flat dense round icon="bar_chart" color="secondary" size="sm" @click="verGrafico(props.row)">
              <q-tooltip>Ver gráfico</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';

const $q = useQuasar();

const loading = ref(false);
const resultados = ref([]);
const mostrarFiltros = ref(false);
const filtroEstado = ref(null);
const filtroResultado = ref(null);
const filtroBusqueda = ref('');

const pagination = ref({
  page: 1,
  rowsPerPage: 10
});

const columns = [
  {
    name: 'numero',
    label: '#',
    field: 'numero',
    align: 'center',
    sortable: true
  },
  {
    name: 'titulo',
    label: 'Título',
    field: 'titulo',
    align: 'left',
    sortable: true
  },
  {
    name: 'a_favor',
    label: 'A Favor',
    field: 'a_favor',
    align: 'center',
    sortable: true
  },
  {
    name: 'en_contra',
    label: 'En Contra',
    field: 'en_contra',
    align: 'center',
    sortable: true
  },
  {
    name: 'abstencion',
    label: 'Abstención',
    field: 'abstencion',
    align: 'center',
    sortable: true
  },
  {
    name: 'total',
    label: 'Total',
    field: 'total',
    align: 'center',
    sortable: true
  },
  {
    name: 'resultado',
    label: 'Resultado',
    field: 'resultado',
    align: 'center',
    sortable: true
  },
  {
    name: 'estado',
    label: 'Estado',
    field: 'estado',
    align: 'center',
    sortable: true
  },
  {
    name: 'acciones',
    label: 'Acciones',
    align: 'center'
  }
];

const opcionesEstado = ['En curso', 'Cerrada', 'Pendiente'];
const opcionesResultado = ['Aprobado', 'Rechazado', 'Empate'];

const resultadosFiltrados = computed(() => {
  let filtrados = [...resultados.value];

  if (filtroEstado.value) {
    filtrados = filtrados.filter(r => r.estado === filtroEstado.value);
  }

  if (filtroResultado.value) {
    filtrados = filtrados.filter(r => r.resultado === filtroResultado.value);
  }

  if (filtroBusqueda.value) {
    const busqueda = filtroBusqueda.value.toLowerCase();
    filtrados = filtrados.filter(r =>
      r.titulo.toLowerCase().includes(busqueda) ||
      r.descripcion.toLowerCase().includes(busqueda)
    );
  }

  return filtrados;
});

const getResultadoColor = (resultado) => {
  const colores = {
    'Aprobado': 'positive',
    'Rechazado': 'negative',
    'Empate': 'warning',
    'Pendiente': 'grey'
  };
  return colores[resultado] || 'grey';
};

const getEstadoColor = (estado) => {
  const colores = {
    'En curso': 'primary',
    'Cerrada': 'positive',
    'Pendiente': 'grey'
  };
  return colores[estado] || 'grey';
};

const cargarResultados = async () => {
  loading.value = true;
  try {
    // TODO: Actualizar endpoint cuando esté disponible en el backend
    // Posiblemente GET /puntos con filtro de pleno y sus votos
    console.warn('Endpoint de resultados pendiente de implementar');
    resultados.value = [];

    // const response = await api.get('/votaciones/resultados');
    // resultados.value = response.data.map((r, index) => ({
    //   ...r,
    //   numero: index + 1,
    //   total: r.a_favor + r.en_contra + r.abstencion
    // }));
  } catch (error) {
    console.error('Error al cargar resultados:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar resultados',
      position: 'top'
    });
  } finally {
    loading.value = false;
  }
};

const verDetalle = (resultado) => {
  $q.dialog({
    title: resultado.titulo,
    message: `
      <strong>Descripción:</strong> ${resultado.descripcion}<br><br>
      <strong>A favor:</strong> ${resultado.a_favor}<br>
      <strong>En contra:</strong> ${resultado.en_contra}<br>
      <strong>Abstención:</strong> ${resultado.abstencion}<br>
      <strong>Total:</strong> ${resultado.total}<br><br>
      <strong>Resultado:</strong> ${resultado.resultado}
    `,
    html: true
  });
};

const verGrafico = (resultado) => {
  $q.notify({
    type: 'info',
    message: 'Función de gráficos en desarrollo',
    position: 'top'
  });
};

onMounted(() => {
  cargarResultados();
});
</script>

<style scoped lang="scss">
.filtros-panel {
  padding: 16px;
  background: #f5f5f5;
  border-radius: 8px;
}

.resultados-table {
  :deep(thead) {
    background-color: #667eea;
    color: white;

    th {
      color: white;
      font-weight: bold;
    }
  }

  :deep(tbody tr:hover) {
    background-color: #f0f0ff;
  }
}
</style>
