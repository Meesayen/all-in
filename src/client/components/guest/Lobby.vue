<style lang="less">
  input[type="text"],
  .token  {
    position: absolute;
    top: 200px;
    left: 50%;
    background: #7ec255;
    color: white;
    font-family: 'PT Sans', sans-serif;
    font-size: 25px;
    font-weight: bold;
    width: 250px;
    height: 65px;
    box-sizing: border-box;
    text-align: center;
    border-radius: 4px;
    box-shadow: inset 0 -2px #a6ff70;
    line-height: 60px;
    letter-spacing: 2px;
    text-shadow: 0 -1px transparent;
    border: 1px solid white;
    z-index: 1;
    text-transform: uppercase;
    transform: translateX(-50%);
  }
  ::-webkit-input-placeholder {
    color: white;
    opacity: .5;
  }

  .button {
    cursor: pointer;
    position: absolute;
    bottom: 100px;
    left: 50%;
    background: #7ec255;
    color: #f2ef11;
    font-family: 'Arvo', serif;
    font-size: 40px;
    font-weight: bold;
    width: 250px;
    height: 65px;
    box-sizing: border-box;
    text-align: center;
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.8);
    box-shadow: inset 0 4px #a6ff70;
    line-height: 65px;
    margin-left: -125px;
    text-shadow: 0 -1px #207f26;

    .loading {
      pointer-events: none;
    }

    @media screen and ( max-height: 400px ) {
      display: none;
    }
  }

  .ai-lobby {
    &[player-color="none"] .page {
      background-color: whitesmoke;
    }
    &[player-color="red"] .page {
      background-color: #f36f62;
    }
    &[player-color="amber"] .page {
      background-color: #fbbe63;
    }
    &[player-color="green"] .page {
      background-color: #7ec255;
    }
    &[player-color="blue"] .page {
      background-color: #40afc3;
    }

    &[state="player-info"] {
      .token {
        display: none;
      }
      .label {
        animation: slide-up 350ms ease-in 50ms forwards;
      }
      .player-info {
        display: block;
      }
    }

    &[state="player-ready"] {
      .waiting-msg {
        display: block;
        color: #fff;
        font-size: 35px;
        top: 50%;
        position: absolute;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 100vw;
      }
      .label,
      .token,
      .button {
        display: none;
      }
    }

    .page {
      position: absolute;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      text-align: center;
      transition: background-color 350ms linear;
      background-image: url(../../../client_old/resources/images/noise.png);

      &.exit {
        animation: box-out 650ms linear 0s forwards;
      }
      &.enter {
        animation: box-in 650ms linear 50ms forwards;
      }
    }

    .game-title {
      position: relative;
      left: 50%;
      background-image: url(../../../client_old/resources/images/all-in-logo.png);
      margin-top: 70px;
      margin-left: -132.5px;
      width: 265px;
      height: 75px;
      background-repeat: no-repeat;
    }

    // .player-info,
    .waiting-msg {
      display: none;
    }

    .label {
      position: absolute;
      font-size: 25px;
      letter-spacing: 3px;
      left: 50%;
      margin-left: -60px;
      top: 210px;
      color: rgba(0, 0, 0, 0.5);
    }

    .notice {
      position: fixed;
      top: -0;
      left: 50%;
      margin-left: -150px;
      width: 300px;
      text-align: center;
      padding: 5px;
      background: rgba(255, 51, 0, 0.72);
      color: white;
      text-shadow: 0 -1px rgba(0, 0, 0, 0.4);
      font-weight: bold;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
      border-radius: 0 0 8px 8px;
      opacity: 1;
      transform: translateY(0);
      transition: transform 250ms ease-out, opacity 350ms linear;
    }
  }

  .notice-enter,
  .notice-leave {
    opacity: 0;
    transform: translateY(-150px);
    transition: transform 150ms ease-in, opacity 350ms linear;
  }

  .colors {
    position: absolute;
    top: 280px;
    width: 250px;
    height: 65px;
    left: 50%;
    transform: translateX(-50%);
    color: #7ec255;

    ul {
      display: flex;
      list-style: none;
      padding: 0;
      margin: 0;
      flex-direction: row;
      justify-content: space-around;
      margin-top: 15px;

      li {
        width: 40px;
        height: 40px;
        border: 1px solid rgba(0, 0, 0, .1);
        border-radius: 3px;
      }
    }

    .color.none {
      background-color: white;
    }
    .color.red {
      background-color: #f36f62;
    }
    .color.amber {
      background-color: #fbbe63;
    }
    .color.green {
      background-color: #7ec255;
    }
    .color.blue {
      background-color: #40afc3;
    }
    .color.sel {
      box-shadow: inset 0 0 0 2px rgba(0, 0, 0, .2)
    }
    .color.locked {
      opacity: .5;
      pointer-events: none;
    }
  }
</style>

<template>
  <div id="lobby" class="ai-lobby" player-color="{{playerColor}}">
    <div class="notice" v-if="isWrongToken" transition="notice">
      The token provided doesn't match any game session.
    </div>
    <div class="notice" v-if="isFullLobby" transition="notice">
      The Lobby is currently full.
      <br />
      Only 4 players at a time are allowed to join a game session.
    </div>
    <div id="page" class="page">
      <div class="game-title"></div>
      <input class="token"
          type="text"
          placeholder="token..."
          maxlength="5"
          v-model="token"
          v-if="isLimbo"
          @keypress.enter="sendToken"/>
      <div class="label">Nickname</div>
      <input class="player-info"
          type="text"
          placeholder="nickname..."
          maxlength="8"
          @keypress.enter="sendReady"
          @keyup="updateNickname |debounce 500"
          v-if="isCustomizing"
          :value="nickname"/>
      <div class="colors" v-show="isCustomizing">
        Choose a color:
        <ul @click="updateColor">
          <li v-for="_color of ['none', 'red', 'amber', 'green', 'blue']"
              class="color"
              data-color="{{_color}}"
              :class="[_color, {
                'sel': color === _color,
                'locked': !availableColors[_color]
              }]"
          ></li>
        </ul>
      </div>
      <div class="button next"
          v-show="isLimbo"
          @click="sendToken">
        SEND
      </div>
      <div class="button next"
          v-show="isCustomizing"
          @click="sendReady">
        READY
      </div>
      <span class="waiting-msg">
        Wait for the game to start...
      </span>
    </div>
  </div>
</template>


<script>
  import { joinGameSession, updateColor, updateNickname } from '../../vuex/guest/actions.js'

  export default {
    data: () => ({
      token: ''
    }),
    methods: {
      sendToken () {
        joinGameSession(this.token.toUpperCase())
      },
      updateColor ({ target }) {
        if (target.dataset.color) {
          updateColor(target.dataset.color)
        }
      },
      updateNickname ({ target }) {
        updateNickname(target.value.toUpperCase())
      },
      sendReady (a, b) {
        console.log(a,b)
      }
    },
    vuex: {
      getters: {
        availableColors: (state) => state.availableColors,
        color: (state) => state.color,
        nickname: (state) => state.nickname,
        isLimbo: (state) => state.state === 'limbo',
        isCustomizing: (state) => state.state === 'customizing',
        isWrongToken: () => {},
        isFullLobby: () => {},
        playerColor: (state) => state.color
      }
    }
  }

</script>
