<template>
  <q-card>
    <q-card-section>
      <div class="text-h6 q-mb-md text-center">Panel de Votación</div>
      <q-separator class="q-mb-lg" />

      <div v-if="!yaVoto" class="votacion-buttons">
        <q-btn
          size="lg"
          color="positive"
          icon="thumb_up"
          label="A Favor"
          class="voto-btn"
          @click="registrarVoto('a_favor')"
          :loading="loading"
          :disable="!puedeVotar"
        >
          <q-tooltip v-if="!puedeVotar">La votación no está activa</q-tooltip>
        </q-btn>

        <q-btn
          size="lg"
          color="negative"
          icon="thumb_down"
          label="En Contra"
          class="voto-btn"
          @click="registrarVoto('en_contra')"
          :loading="loading"
          :disable="!puedeVotar"
        >
          <q-tooltip v-if="!puedeVotar">La votación no está activa</q-tooltip>
        </q-btn>

        <q-btn
          size="lg"
          color="warning"
          icon="remove"
          label="Abstención"
          class="voto-btn"
          @click="registrarVoto('abstencion')"
          :loading="loading"
          :disable="!puedeVotar"
        >
          <q-tooltip v-if="!puedeVotar">La votación no está activa</q-tooltip>
        </q-btn>
      </div>

      <div v-else class="voto-registrado">
        <q-icon name="check_circle" color="positive" size="64px" />
        <div class="text-h6 q-mt-md">¡Voto Registrado!</div>
        <div class="text-body2 text-grey-7">
          Su voto ha sido registrado como: 
          <strong>{{ votoActual }}</strong>
        </div>
        <q-btn
          v-if="puedeModificar"
          flat
          color="primary"
          label="Modificar voto"
          class="q-mt-md"
          @click="modificarVoto"
        />
      </div>
    </q-card-section>

    <q-card-section class="q-pt-none">
      <q-separator class="q-mb-md" />
      <div class="conteo-tiempo">
        <div class="tiempo-restante">
          <q-icon name="timer" color="primary" size="sm" />
          <span class="q-ml-sm">Tiempo restante: {{ tiempoRestante }}</span>
        </div>
        <q-linear-progress
          :value="progresoTiempo"
          color="primary"
          size="8px"
          class="q-mt-sm"
        />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { useVotoStore } from 'stores/votoStore';
import { useUserStore } from 'stores/userStore';

const route = useRoute();
const $q = useQuasar();
const votoStore = useVotoStore();
const userStore = useUserStore();

const loading = ref(false);
const yaVoto = ref(false);
const votoActual = ref('');
const tiempoRestante = ref('5:00');
const progresoTiempo = ref(1);
let intervalo = null;

const puedeVotar = computed(() => {
  return votoStore.votacionActual?.estado === 'en_curso' && userStore.canVotar;
});

const puedeModificar = computed(() => {
  return votoStore.votacionActual?.permite_modificacion && puedeVotar.value;
});

const registrarVoto = async (tipoVoto) => {
  loading.value = true;

  $q.dialog({
    title: 'Confirmar voto',
    message: `¿Está seguro de votar "${tipoVoto.replace('_', ' ')}"?`,
    cancel: {
      label: 'Cancelar',
      color: 'grey',
      flat: true
    },
    ok: {
      label: 'Confirmar',
      color: 'primary'
    },
    persistent: true
  }).onOk(async () => {
    try {
      await votoStore.registrarVoto(route.params.id, tipoVoto);
      
      yaVoto.value = true;
      votoActual.value = tipoVoto.replace('_', ' ');

      $q.notify({
        type: 'positive',
        message: '¡Voto registrado exitosamente!',
        position: 'top',
        icon: 'check_circle'
      });
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: error.response?.data?.message || 'Error al registrar el voto',
        position: 'top'
      });
    } finally {
      loading.value = false;
    }
  }).onCancel(() => {
    loading.value = false;
  });
};

const modificarVoto = () => {
  yaVoto.value = false;
  votoActual.value = '';
};

const iniciarTemporizador = () => {
  let segundosRestantes = 300; // 5 minutos
  
  intervalo = setInterval(() => {
    segundosRestantes--;
    
    const minutos = Math.floor(segundosRestantes / 60);
    const segundos = segundosRestantes % 60;
    tiempoRestante.value = `${minutos}:${segundos.toString().padStart(2, '0')}`;
    
    progresoTiempo.value = segundosRestantes / 300;
    
    if (segundosRestantes <= 0) {
      clearInterval(intervalo);
      $q.notify({
        type: 'warning',
        message: 'Tiempo de votación agotado',
        position: 'top'
      });
    }
  }, 1000);
};

onMounted(() => {
  // Verificar si el usuario ya votó
  const miVoto = votoStore.votos.find(v => v.magistrado_id === userStore.user?.id);
  if (miVoto) {
    yaVoto.value = true;
    votoActual.value = miVoto.tipo_voto.replace('_', ' ');
  }

  if (puedeVotar.value) {
    iniciarTemporizador();
  }
});

onUnmounted(() => {
  if (intervalo) {
    clearInterval(intervalo);
  }
});
</script>

<style scoped lang="scss">
.votacion-buttons {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  padding: 20px;
}

.voto-btn {
  height: 80px;
  font-size: 18px;
  font-weight: bold;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
}

.voto-registrado {
  text-align: center;
  padding: 40px 20px;
}

.conteo-tiempo {
  padding: 16px;
  background: #f5f5f5;
  border-radius: 8px;
}

.tiempo-restante {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 500;
  color: #333;
}
</style>
