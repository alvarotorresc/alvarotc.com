export {};

declare global {
  interface Window {
    __applyTheme?: (theme: 'light' | 'dark') => void;
  }
}
