global.browser = require('webextension-polyfill')

import Vue from 'vue'
import App from './App'
import BootstrapVue from 'bootstrap-vue'

Vue.use(BootstrapVue)

Vue.config.devtools = true

var aa = new Vue({
  el: '#sync',
  render: h => h(App),
})
