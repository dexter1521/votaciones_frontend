import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from 'boot/axios';

export const usePlenoStore = defineStore('pleno', () => {
  const plenos = ref([]);
  const plenoActual = ref(null);
  const plenosActivos = ref([]);
  const loading = ref(false);

  const cargarPlenos = async () => {
    loading.value = true;
    try {
      const response = await api.get('/plenos');
      plenos.value = response.data;
      return plenos.value;
    } catch (error) {
      console.error('Error al cargar plenos:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const cargarPlenosActivos = async () => {
    loading.value = true;
    try {
      const response = await api.get('/plenos/activos');
      plenosActivos.value = response.data;
      return plenosActivos.value;
    } catch (error) {
      console.error('Error al cargar plenos activos:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const cargarPleno = async (plenoId) => {
    loading.value = true;
    try {
      const response = await api.get(`/plenos/${plenoId}`);
      plenoActual.value = response.data;
      return plenoActual.value;
    } catch (error) {
      console.error('Error al cargar pleno:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const crearPleno = async (plenoData) => {
    loading.value = true;
    try {
      const response = await api.post('/plenos', plenoData);
      plenos.value.push(response.data);
      return response.data;
    } catch (error) {
      console.error('Error al crear pleno:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const iniciarPleno = async (plenoId) => {
    loading.value = true;
    try {
      const response = await api.put(`/plenos/${plenoId}/iniciar`);
      plenoActual.value = response.data;
      actualizarPlenoEnLista(response.data);
      return response.data;
    } catch (error) {
      console.error('Error al iniciar pleno:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const finalizarPleno = async (plenoId) => {
    loading.value = true;
    try {
      const response = await api.put(`/plenos/${plenoId}/finalizar`);
      plenoActual.value = response.data;
      actualizarPlenoEnLista(response.data);
      return response.data;
    } catch (error) {
      console.error('Error al finalizar pleno:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const cargarResultados = async (plenoId) => {
    loading.value = true;
    try {
      const response = await api.get(`/plenos/${plenoId}/resultados`);
      return response.data;
    } catch (error) {
      console.error('Error al cargar resultados:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const actualizarPleno = (plenoData) => {
    if (plenoActual.value && plenoActual.value.id === plenoData.id) {
      plenoActual.value = { ...plenoActual.value, ...plenoData };
    }
    actualizarPlenoEnLista(plenoData);
  };

  const actualizarPlenoEnLista = (plenoData) => {
    const index = plenos.value.findIndex(p => p.id === plenoData.id);
    if (index !== -1) {
      plenos.value[index] = { ...plenos.value[index], ...plenoData };
    }
    
    const indexActivo = plenosActivos.value.findIndex(p => p.id === plenoData.id);
    if (indexActivo !== -1) {
      plenosActivos.value[indexActivo] = { ...plenosActivos.value[indexActivo], ...plenoData };
    }
  };

  return {
    plenos,
    plenoActual,
    plenosActivos,
    loading,
    cargarPlenos,
    cargarPlenosActivos,
    cargarPleno,
    crearPleno,
    iniciarPleno,
    finalizarPleno,
    cargarResultados,
    actualizarPleno
  };
});
