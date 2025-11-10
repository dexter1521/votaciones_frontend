const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: () => import('layouts/BlankLayout.vue'),
    children: [
      {
        path: '',
        name: 'login',
        component: () => import('pages/LoginPage.vue')
      }
    ]
  },
  {
    path: '/dashboard',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('pages/Dashboard.vue')
      }
    ]
  },
  {
    path: '/plenos',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'plenos',
        component: () => import('pages/PlenosGestion.vue')
      }
    ]
  },
  {
    path: '/pleno',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: ':id',
        name: 'pleno',
        component: () => import('pages/PlenoView.vue')
      }
    ]
  },
  {
    path: '/votacion',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: ':id?',
        name: 'votacion',
        component: () => import('pages/VotacionView.vue')
      }
    ]
  },
  {
    path: '/resultados',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: ':id?',
        name: 'resultados',
        component: () => import('pages/ResultadosView.vue')
      }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
];

export default routes;
