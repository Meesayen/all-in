<style>
  .game-area {
    position: absolute;
    background: #00994a;
    background-image: url(../../../client_old/resources/images/noise.png);
  }
  .game-area[data-state="lobby"] {
    width: 485px;
    height: 360px;
    left: 50%;
    top: 50px;
    margin-left: -242.5px;
    border-radius: 15px;
    box-shadow: inset 0 5px #7ec255;
  }
  .game-area[data-state="table"] {
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    margin-left: 0px;
    border-radius: 0px;
    box-shadow: none;
    transition: width 250ms ease-out,
      height 250ms ease-out,
      top 250ms ease-out,
      left 250ms ease-out,
      margin-left 250ms ease-out,
      border-radius 250ms ease-out,
      box-shadow 250ms ease-out;
  }
  .game-area[data-state="table"] .game-title {
    margin-top: 50px;
    transition: margin-top 250ms ease-out;
  }
</style>

<template>
  <div class="app">
    <div class="game-area" data-state="{{gameState}}">
      <div class="game-title"></div>
      <lobby></lobby>
      <roster></roster>
      <!-- <table></table> -->
    </div>
  </div>
</template>

<script>
  import Lobby from './Lobby.vue'
  import Roster from './Roster.vue'
  // import Table from './Table.vue'

  import store from '../../vuex/host/store.js'

  require('../../../client_old/styles/desktop.less')

  export default {
    store,
    components: {
      Lobby,
      Roster
      // Table
    },
    vuex: {
      getters: {
        gameState: (state) => state.game.state
      }
    }
  }

</script>
