import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api, setAuthToken, setUnauthorizedHandler } from 'boot/axios';
import { socket } from 'boot/socket.io';

export const useUserStore = defineStore('user', () => {
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'));
  const token = ref(localStorage.getItem('token') || null);
  const isAuthenticated = ref(!!token.value && !!user.value);

  // Permisos del usuario
  const canIniciarPleno = ref(false);
  const canIniciarVotacion = ref(false);
  const canCerrarVotacion = ref(false);
  const canVotar = ref(false);

  const login = async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      const { access_token, user: userData } = response.data;

      token.value = access_token;
      user.value = userData;
      isAuthenticated.value = true;

      setAuthToken(access_token);

      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Establecer permisos según rol
      setPermisos(userData.rol);
      
      // Conectar socket con autenticación
      socket.auth = { token: access_token };
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
    localStorage.removeItem('user');
    
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
      case 'oficial_mayor':
        canIniciarPleno.value = true;
        canIniciarVotacion.value = true;
        canCerrarVotacion.value = true;
        canVotar.value = true;
        break;
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
      isAuthenticated.value = true;
      setPermisos(response.data.rol);
      
      // Reconectar socket si estaba desconectado
      if (!socket.connected) {
        socket.auth = { token: token.value };
        socket.connect();
      }
      
      return true;
    } catch (error) {
      console.error('Error en checkAuth:', error.response?.status, error.message);
      
      // Solo limpiar sesión si es un error 401 (no autorizado)
      // Para otros errores (como 404 endpoint no existe), mantener la sesión
      if (error.response?.status === 401) {
        logout();
        return false;
      }
      
      // Si el endpoint no existe o hay error de red, 
      // mantener la sesión pero retornar false para indicar que no se pudo verificar
      return false;
    }
  };

  // Inicializar token y permisos al cargar el store
  if (token.value) {
    setAuthToken(token.value);
  }
  
  // Restaurar permisos si hay usuario guardado
  if (user.value) {
    setPermisos(user.value.rol);
  }

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
