import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './index.css'
import '../node_modules/flowbite-vue/dist/index.css'
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import Tooltip from 'primevue/tooltip';

const app = createApp(App)

app.directive('tooltip', Tooltip);

app.use(PrimeVue, {
    theme: {
        preset: Aura
    }
});

app.use(router)

app.mount('#app')
