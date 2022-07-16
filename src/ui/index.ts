import { createApp } from 'vue';
import App from './components/App.vue';

if (process.env.NODE_ENV === 'development') {
  globalThis.__VUE_OPTIONS_API__ = true;
  globalThis.__VUE_PROD_DEVTOOLS__ = true;
} else {
  globalThis.__VUE_OPTIONS_API__ = false;
  globalThis.__VUE_PROD_DEVTOOLS__ = false;
}

const app = createApp(App);
app.mount('#app');
