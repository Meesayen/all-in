<style lang="less">
  .ai-player {
    display: flex;
    flex: 1;
    justify-content: center;
    max-width: 25%;
    box-sizing: border-box;
  }
  .player {
    position: relative;
    width: 120px;
    height: 100px;
    display: inline-block;
    margin: 15px;
    margin-left: 8%;
    margin-right: 8%;
    border-radius: 5px;
    box-sizing: border-box;
    -webkit-filter: drop-shadow(0 5px 2px rgba(0, 0, 0, .2));
    transition: -webkit-filter 200ms ease-in, top 200ms ease-in;

    .status {
      position: absolute;
      bottom: 0;
      width: 100%;
      height: 26px;
      box-sizing: border-box;
      font-size: 12px;
      text-align: center;
      text-transform: uppercase;
      color: white;
      font-family: monospace;
      line-height: 27px;
      border-radius: 5px 5px 4px 4px;
    }

    .cash {
      position: absolute;
      top: 14px;
      width: 100%;
      box-sizing: border-box;
      text-align: right;
      padding-right: 8px;
      font-size: 12px;
      color: white;

      &:before {
        content: 'Ϡ';
        width: 15px;
        height: 10px;
        margin-right: 5px;
        display: inline-block;
        background-size: 15px 10px;
        background-repeat: no-repeat;
      }
    }

    &[player-id="player1"] .status {
      background: #f36f62;
    }
    &[player-id="player2"] .status {
      background: #fbbe63;
    }
    &[player-id="player3"] .status {
      background: #7ec255;
    }
    &[player-id="player4"] .status {
      background: #40afc3;
    }
    &.thinking {
      -webkit-filter: drop-shadow(0 10px 4px rgba(0, 0, 0, .4));
      top: -5px;
    }

    &.float {
      -webkit-filter: none;
      transform: translateY(0);
      -webkit-animation: player-float 650ms linear 0s infinite alternate;
      animation: player-float 650ms linear 0s infinite alternate;
    }
    &.float:after {
      content: '';
      position: absolute;
      width: 180px;
      bottom: -30px;
      left: -30px;
      height: 17px;
      background: -webkit-radial-gradient(center, rgba(0, 0, 0, 0.3), transparent, transparent);
      transform: scale(1);
      -webkit-animation: shadow-expand 650ms linear 0s infinite alternate;
      animation: shadow-expand 650ms linear 0s infinite alternate;
    }
  }

  [player-id="player1"] {
    background: #F6897E;
    box-shadow: inset 0 4px #BD5B52;
    border: 2px solid #BD5B52;
  }
  [player-id="player2"] {
    background: #F7D080;
    box-shadow: inset 0 4px #AF7814;
    border: 2px solid #AF7814;
  }
  [player-id="player3"] {
    background: #9BD578;
    box-shadow: inset 0 4px #456E2D;
    border: 2px solid #456E2D;
  }
  [player-id="player4"] {
    background: #7AC4D1;
    box-shadow: inset 0 4px #227180;
    border: 2px solid #227180;
  }

  .nickname {
    position: absolute;
    text-align: right;
    padding-right: 8px;
    color: white;
    font-weight: bold;
    text-transform: uppercase;
    font-family: monospace;
    font-size: 16px;
    bottom: 38px;
    width: 100%;
    box-sizing: border-box;
  }

  .pop-enter {
    -webkit-filter: none;
    -webkit-animation: player-pop 150ms ease-in 0s;
    animation: player-pop 150ms ease-in 0s;
  }

  .pop-leave {
    transform: translateY(0);
    -webkit-animation: player-puff 200ms ease-out 0s;
    animation: player-puff 200ms ease-out 0s;
  }

</style>

<template>
  <div class="ai-player" transition="pop">
    <div id="balloon"
        class="player"
        :class="{ 'float': isCustomizing }"
        player-id='{{player.id}}'>
      <div class="cash">{{player.cash}}</div>
      <div class="nickname">{{player.nickname}}</div>
      <div class="status">{{player.state}}</div>
    </div>
  </div>
</template>

<script>

  export default {
    props: ['player'],
    computed: {
      isCustomizing () {
        return this.player.state === 'customizing'
      }
    },
    vuex: {
    }
  }

</script>
