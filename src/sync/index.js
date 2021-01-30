import Vue from 'vue'
import App from './App'
import * as Sentry from "@sentry/vue";

// Vue.config.devtools = true

Sentry.init({
  Vue,
  dsn: "https://53af3f0d377d48f9ba39c880a6616955@o100957.ingest.sentry.io/5615596",
});

new Vue({
  el: '#sync',
  render: h => h(App),
})
