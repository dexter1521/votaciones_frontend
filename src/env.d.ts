/* eslint-disable */

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: string;
    VUE_ROUTER_MODE: 'hash' | 'history' | 'abstract' | undefined;
    VUE_ROUTER_BASE: string | undefined;
    VUE_APP_API_URL: string | undefined;
    VUE_APP_SOCKET_URL: string | undefined;
  }
}
