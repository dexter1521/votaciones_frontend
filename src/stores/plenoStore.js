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
      // Filtrar plenos activos del lado del cliente
      const response = await api.get('/plenos');
      plenosActivos.value = response.data.filter(p => p.estado === 'en_sesion');
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

  const actualizarPleno = async (plenoId, plenoData) => {
    loading.value = true;
    try {
      const response = await api.patch(`/plenos/${plenoId}`, plenoData);
      const id = plenoActual.value?.id_pleno || plenoActual.value?.id;
      if (plenoActual.value && id === plenoId) {
        plenoActual.value = response.data;
      }
      actualizarPlenoEnLista(response.data);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar pleno:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const eliminarPleno = async (plenoId) => {
    loading.value = true;
    try {
      await api.delete(`/plenos/${plenoId}`);
      plenos.value = plenos.value.filter(p => (p.id_pleno || p.id) !== plenoId);
      plenosActivos.value = plenosActivos.value.filter(p => (p.id_pleno || p.id) !== plenoId);
      const id = plenoActual.value?.id_pleno || plenoActual.value?.id;
      if (plenoActual.value && id === plenoId) {
        plenoActual.value = null;
      }
    } catch (error) {
      console.error('Error al eliminar pleno:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const iniciarPleno = async (plenoId) => {
    return await actualizarPleno(plenoId, { estado: 'en_sesion' });
  };

  const finalizarPleno = async (plenoId) => {
    return await actualizarPleno(plenoId, { estado: 'cerrado' });
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

  const sincronizarPleno = (plenoData) => {
    const idActual = plenoActual.value?.id_pleno || plenoActual.value?.id;
    const idData = plenoData.id_pleno || plenoData.id;
    if (plenoActual.value && idActual === idData) {
      plenoActual.value = { ...plenoActual.value, ...plenoData };
    }
    actualizarPlenoEnLista(plenoData);
  };

  const actualizarPlenoEnLista = (plenoData) => {
    const idData = plenoData.id_pleno || plenoData.id;
    const index = plenos.value.findIndex(p => (p.id_pleno || p.id) === idData);
    if (index !== -1) {
      plenos.value[index] = { ...plenos.value[index], ...plenoData };
    }

    const indexActivo = plenosActivos.value.findIndex(p => (p.id_pleno || p.id) === idData);
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
    actualizarPleno,
    eliminarPleno,
    iniciarPleno,
    finalizarPleno,
    cargarResultados,
    sincronizarPleno
  };
});
