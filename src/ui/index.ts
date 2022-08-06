import { createApp } from 'vue';
import App from './components/App.vue';
import { PlausibleArgs } from './globals';
import { EasterEggs } from './services/easter-eggs';

if (process.env.NODE_ENV === 'development') {
  globalThis.__VUE_OPTIONS_API__ = true;
  globalThis.__VUE_PROD_DEVTOOLS__ = true;
} else {
  globalThis.__VUE_OPTIONS_API__ = false;
  globalThis.__VUE_PROD_DEVTOOLS__ = false;
}

const app = createApp(App);
app.mount('#app');

new EasterEggs();

window.plausible =
  window.plausible ||
  function (...args: PlausibleArgs) {
    (window.plausible.q = window.plausible.q || []).push(args);
  };
