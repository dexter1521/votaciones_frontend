/* eslint-disable */
// Mocks all files ending in `.vue` showing them as plain Vue instances
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module 'quasar' {
  interface Notify {
    (options: any): void;
  }

  interface Dialog {
    (options: any): any;
  }

  interface Loading {
    show(options?: any): void;
    hide(): void;
  }
}
