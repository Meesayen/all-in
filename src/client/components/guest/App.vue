<style>

</style>

<template>
  <div class="app">
    <lobby></lobby>
    <!-- <table></table> -->
  </div>
</template>

<script>
  import Lobby from './Lobby.vue'
  // import Table from './Table.vue'

  import store from '../../vuex/guest/store.js'

  require('../../../client_old/styles/mobile.less')

  export default {
    store,
    components: {
      Lobby
      // Table
    }
  }

</script>
