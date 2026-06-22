declare module 'vue-plugin-hiprint' {
  export const hiprint: any;
  export const defaultElementTypeProvider: any;
  export function disAutoConnect(): void;
  export function autoConnect(callback?: (status: boolean, message?: string) => void): void;
}
