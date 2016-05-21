<style media="screen">

</style>

<template>
  <div class="app">
    <div class="game-area" data-state="lobby"></div>
      <div class="game-title"></div>
      <lobby></lobby>
      <!-- <roster></roster>
      <table></table> -->
  </div>
</template>

<script>
  import Lobby from './Lobby.vue'
  // import Roster from './Roster.vue'
  // import Table from './Table.vue'

  import store from '../../vuex/host/store.js'

  var mainCss = require('../../../client_old/styles/main.less');
  var desktopCss = require('../../../client_old/styles/desktop.less');

  export default {
    store,
    components: {
      Lobby,
      // Roster,
      // Table
    }
  }
</script>
