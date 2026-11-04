/**
 * Service Worker Registration for Offline EMR PWA
 */

export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('J & J Memorial Service Worker registered:', registration.scope);
        })
        .catch((error) => {
          console.warn('Service worker registration failed:', error);
        });
    });
  }
}
