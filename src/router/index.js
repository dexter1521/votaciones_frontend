import { route } from 'quasar/wrappers';
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router';
import routes from './routes';
import { useUserStore } from 'stores/userStore';

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory);

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    history: createHistory(process.env.VUE_ROUTER_BASE)
  });

  // Guard de autenticación
  Router.beforeEach((to, from, next) => {
    // Rutas públicas que no requieren autenticación
    const rutasPublicas = ['login'];
    const requiereAuth = !rutasPublicas.includes(to.name);

    if (requiereAuth) {
      const userStore = useUserStore();
      
      // Verificar si hay token y usuario en el store
      if (!userStore.token || !userStore.user) {
        next({ name: 'login' });
        return;
      }
    } else if (to.name === 'login') {
      // Si ya está autenticado y va a login, redirigir al dashboard
      const userStore = useUserStore();
      if (userStore.isAuthenticated && userStore.user) {
        next({ name: 'dashboard' });
        return;
      }
    }

    next();
  });

  return Router;
});
