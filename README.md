# Sistema de Votación (votacion-front)

Sistema de Votación en tiempo real con Vue 3 + Quasar + PWA

## Instalar dependencias

```bash
npm install
```

### Iniciar app en modo desarrollo (hot-code reloading, error reporting, etc.)

```bash
npm run dev
```

### Compilar para producción

```bash
npm run build
```

### Compilar PWA

```bash
npm run build:pwa
```

## Estructura del Proyecto

```
votacion-front/
├── src/
│   ├── boot/
│   │   ├── axios.ts          ✅ Configuración API con interceptors
│   │   └── socket.io.ts      ✅ Conexión WebSocket en tiempo real
│   ├── pages/
│   │   ├── LoginPage.vue     ✅ Página de login con validación
│   │   ├── Dashboard.vue     ✅ Panel principal con estadísticas
│   │   ├── PlenoView.vue     ✅ Vista del pleno activo
│   │   ├── VotacionView.vue  ✅ Sistema de votación
│   │   └── ResultadosView.vue ✅ Resultados y estadísticas
│   ├── stores/
│   │   ├── userStore.js      ✅ Gestión de usuarios y permisos
│   │   ├── plenoStore.js     ✅ Gestión de plenos
│   │   └── votoStore.js      ✅ Gestión de votaciones
│   ├── components/
│   │   ├── ListaMagistrados.vue  ✅ Lista con estado en tiempo real
│   │   ├── PuntosOrdenDia.vue    ✅ Orden del día con progreso
│   │   ├── PanelVotacion.vue     ✅ Panel de votación interactivo
│   │   └── ResultadosTabla.vue   ✅ Tabla de resultados con filtros
│   └── router/
│       └── index.js          ✅ Rutas con guards de autenticación
├── package.json              ✅ Con socket.io-client v4.7.2
└── quasar.config.js          ✅ Configurado para PWA
```
