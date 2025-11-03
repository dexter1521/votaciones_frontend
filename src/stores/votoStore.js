import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from 'boot/axios';
import { socket } from 'boot/socket.io';

export const useVotoStore = defineStore('voto', () => {
  const votacionActual = ref(null);
  const votaciones = ref([]);
  const votos = ref([]);
  const loading = ref(false);

  const conteoVotos = computed(() => {
    if (!votos.value || votos.value.length === 0) {
      return {
        a_favor: 0,
        en_contra: 0,
        abstencion: 0,
        total: 0
      };
    }

    const conteo = votos.value.reduce((acc, voto) => {
      if (voto.tipo_voto === 'a_favor') acc.a_favor++;
      if (voto.tipo_voto === 'en_contra') acc.en_contra++;
      if (voto.tipo_voto === 'abstencion') acc.abstencion++;
      acc.total++;
      return acc;
    }, { a_favor: 0, en_contra: 0, abstencion: 0, total: 0 });

    return conteo;
  });

  const cargarVotaciones = async (plenoId) => {
    loading.value = true;
    try {
      const response = await api.get(`/plenos/${plenoId}/votaciones`);
      votaciones.value = response.data;
      return votaciones.value;
    } catch (error) {
      console.error('Error al cargar votaciones:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const cargarVotacion = async (votacionId) => {
    loading.value = true;
    try {
      const response = await api.get(`/votaciones/${votacionId}`);
      votacionActual.value = response.data;
      
      // Cargar votos de la votación
      const votosResponse = await api.get(`/votaciones/${votacionId}/votos`);
      votos.value = votosResponse.data;
      
      // Unirse a la sala de socket para recibir actualizaciones en tiempo real
      socket.emit('join_votacion', votacionId);
      
      return votacionActual.value;
    } catch (error) {
      console.error('Error al cargar votación:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const crearVotacion = async (votacionData) => {
    loading.value = true;
    try {
      const response = await api.post('/votaciones', votacionData);
      votaciones.value.push(response.data);
      return response.data;
    } catch (error) {
      console.error('Error al crear votación:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const iniciarVotacion = async (votacionId) => {
    loading.value = true;
    try {
      const response = await api.put(`/votaciones/${votacionId}/iniciar`);
      votacionActual.value = response.data;
      actualizarVotacionEnLista(response.data);
      return response.data;
    } catch (error) {
      console.error('Error al iniciar votación:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const cerrarVotacion = async (votacionId) => {
    loading.value = true;
    try {
      const response = await api.put(`/votaciones/${votacionId}/cerrar`);
      votacionActual.value = response.data;
      actualizarVotacionEnLista(response.data);
      
      // Salir de la sala de socket
      socket.emit('leave_votacion', votacionId);
      
      return response.data;
    } catch (error) {
      console.error('Error al cerrar votación:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const registrarVoto = async (votacionId, tipoVoto) => {
    loading.value = true;
    try {
      const response = await api.post(`/votaciones/${votacionId}/votar`, {
        tipo_voto: tipoVoto
      });
      
      // El voto se actualizará automáticamente vía socket
      return response.data;
    } catch (error) {
      console.error('Error al registrar voto:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const actualizarVoto = (votoData) => {
    const index = votos.value.findIndex(v => v.magistrado_id === votoData.magistrado_id);
    if (index !== -1) {
      votos.value[index] = votoData;
    } else {
      votos.value.push(votoData);
    }
  };

  const actualizarVotacionEnLista = (votacionData) => {
    const index = votaciones.value.findIndex(v => v.id === votacionData.id);
    if (index !== -1) {
      votaciones.value[index] = { ...votaciones.value[index], ...votacionData };
    }
  };

  const limpiarVotacionActual = () => {
    if (votacionActual.value) {
      socket.emit('leave_votacion', votacionActual.value.id);
    }
    votacionActual.value = null;
    votos.value = [];
  };

  return {
    votacionActual,
    votaciones,
    votos,
    conteoVotos,
    loading,
    cargarVotaciones,
    cargarVotacion,
    crearVotacion,
    iniciarVotacion,
    cerrarVotacion,
    registrarVoto,
    actualizarVoto,
    limpiarVotacionActual
  };
});
