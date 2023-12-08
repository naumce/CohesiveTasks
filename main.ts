import { createApp } from 'vue'
import pinia from '@/plugins/pinia'

import App from './App.vue'
import router from './router'
import i18n from './plugins//i18n'
import vuetify from './plugins/vuetify'
import '@mdi/font/css/materialdesignicons.css'
import PortalVue from 'portal-vue';
import TextClamp from 'vue3-text-clamp';
import * as Sentry from "@sentry/vue";

import '@/assets/styles/main.scss';

import type { AppConfiguration } from '@/types'

import { globalCookiesConfig } from 'vue3-cookies'
globalCookiesConfig({
  expireTimes: '30d',
  path: '/',
  domain: '',
  secure: window.location.protocol === 'https:',
  sameSite: 'None'
})
const app = createApp(App)

const config: AppConfiguration = {
  api_root: import.meta.env.VITE_APP_USV_BASEURL
}
app.provide('appConfig', config);

if (import.meta.env.VITE_APP_ENV !== 'localhost') {
  Sentry.init({
    app,
    environment: import.meta.env.VITE_APP_ENV,
    dsn: "https://aaa24e513a6054cc767f9be18ef6d236@o4504379199389696.ingest.sentry.io/4505941616033792",
    integrations: [
      new Sentry.BrowserTracing({
        // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
        tracePropagationTargets: ["localhost", config.api_root],
        routingInstrumentation: Sentry.vueRouterInstrumentation(router),
      }),
      new Sentry.Replay(),
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0, // Capture 100% of the transactions, reduce in production!
    // Session Replay
    replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
    replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
  });
}


app.use(pinia)
app.use(router)
app.use(vuetify)
app.use(i18n)
app.use(PortalVue)
app.use(TextClamp)

app.mount('#app')
