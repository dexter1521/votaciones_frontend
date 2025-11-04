import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api, setAuthToken, setUnauthorizedHandler } from 'boot/axios';
import { socket } from 'boot/socket.io';

export const useUserStore = defineStore('user', () => {
  const user = ref(null);
  const token = ref(localStorage.getItem('token') || null);
  const isAuthenticated = ref(!!token.value);

  // Permisos del usuario
  const canIniciarPleno = ref(false);
  const canIniciarVotacion = ref(false);
  const canCerrarVotacion = ref(false);
  const canVotar = ref(false);

  const login = async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      const { token: newToken, user: userData } = response.data;

      token.value = newToken;
      user.value = userData;
      isAuthenticated.value = true;

  setAuthToken(newToken);

      localStorage.setItem('token', newToken);
      
      // Establecer permisos según rol
      setPermisos(userData.rol);
      
      // Conectar socket con autenticación
      socket.auth = { token: newToken };
      socket.connect();

      return userData;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al iniciar sesión');
    }
  };

  const logout = () => {
    user.value = null;
    token.value = null;
    isAuthenticated.value = false;

  setAuthToken(null);
    
    localStorage.removeItem('token');
    
    // Desconectar socket
    socket.disconnect();
    
    // Limpiar permisos
    canIniciarPleno.value = false;
    canIniciarVotacion.value = false;
    canCerrarVotacion.value = false;
    canVotar.value = false;
  };

  const setUser = (userData) => {
    user.value = userData;
    setPermisos(userData.rol);
  };

  const setPermisos = (rol) => {
    switch (rol) {
      case 'administrador':
        canIniciarPleno.value = true;
        canIniciarVotacion.value = true;
        canCerrarVotacion.value = true;
        canVotar.value = true;
        break;
      case 'secretario':
        canIniciarPleno.value = true;
        canIniciarVotacion.value = true;
        canCerrarVotacion.value = true;
        canVotar.value = false;
        break;
      case 'magistrado':
        canIniciarPleno.value = false;
        canIniciarVotacion.value = false;
        canCerrarVotacion.value = false;
        canVotar.value = true;
        break;
      default:
        canIniciarPleno.value = false;
        canIniciarVotacion.value = false;
        canCerrarVotacion.value = false;
        canVotar.value = false;
    }
  };

  const checkAuth = async () => {
    if (!token.value) {
      return false;
    }

    try {
      const response = await api.get('/auth/me');
      user.value = response.data;
      setPermisos(response.data.rol);
      return true;
    } catch (error) {
      logout();
      return false;
    }
  };

  setAuthToken(token.value);

  setUnauthorizedHandler(() => {
    logout();

    if (window.location.hash !== '#/login') {
      window.location.href = '/#/login';
    }
  });

  return {
    user,
    token,
    isAuthenticated,
    canIniciarPleno,
    canIniciarVotacion,
    canCerrarVotacion,
    canVotar,
    login,
    logout,
    setUser,
    checkAuth
  };
});
