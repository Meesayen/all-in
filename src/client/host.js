var Vue = require('vue')

var App = require('./components/host/App.vue')

require('./firebase/api.js')

/* eslint-disable */
new Vue({
  el: 'body',
  components: {
    app: App
  }
})
/* eslint-enable */
