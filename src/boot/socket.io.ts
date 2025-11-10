import { boot } from 'quasar/wrappers';
import { io, Socket } from 'socket.io-client';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $socket: Socket;
  }
}

// Configuración de Socket.IO
const socket: Socket = io(process.env.SOCKET_URL || 'http://localhost:3001', {
  autoConnect: false,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
  transports: ['websocket', 'polling']
});

// Eventos de conexión
socket.on('connect', () => {
  console.log('✅ Socket.IO conectado:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('❌ Socket.IO desconectado:', reason);
});

socket.on('connect_error', (error) => {
  console.error('❌ Error de conexión Socket.IO:', error.message);
});

socket.on('reconnect', (attemptNumber) => {
  console.log('🔄 Socket.IO reconectado después de', attemptNumber, 'intentos');
});

export default boot(({ app }) => {
  app.config.globalProperties.$socket = socket;
});

export { socket };
