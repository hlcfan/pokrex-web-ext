global.browser = require('webextension-polyfill')

import Vue from 'vue'
import App from './App'
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

Vue.use(BootstrapVue)

Vue.config.devtools = true

var aa = new Vue({
  el: '#prepare',
  render: h => h(App),
})
