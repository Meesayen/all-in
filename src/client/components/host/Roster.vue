<style lang="less">
  .ai-roster {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    padding: 0;
    margin: 40px 0;
    text-align: center;
    position: fixed;
    width: 100%;
    left: 0;
    bottom: 80px;
  }

</style>

<template>
  <div class="ai-roster players">
    <player v-for="(id, player) of players"
        :player="player"
    ></player>
  </div>
</template>

<script>
  import Player from './Player.vue'

  export default {
    components: {
      Player
    },
    vuex: {
      getters: {
        players: (state) => state.game.players
      }
    }
  }

</script>
