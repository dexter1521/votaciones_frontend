import { store } from 'quasar/wrappers';
import { createPinia } from 'pinia';

// Export default para compatibilidad con Quasar
export default store((/* { ssrContext } */) => {
  const pinia = createPinia();
  return pinia;
});

// Exportar stores individuales
export { useUserStore } from './userStore';
export { usePlenoStore } from './plenoStore';
export { useVotoStore } from './votoStore';
