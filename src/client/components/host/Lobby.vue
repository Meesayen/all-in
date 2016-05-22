<style lang="less">
  .phone-img,
  .arrow,
  .url-box,
  .token-box {
    position: absolute;
    opacity: 0;
  }

  .phone-img {
    opacity: 1;
    width: 95px;
    height: 140px;
    top: 30px;
    left: 50%;
    margin-left: -50px;
    background: url(../../../client_old/resources/images/device.png);
    background-repeat: no-repeat;

    .viewport {
      width: 58px;
      height: 88px;
      position: absolute;
      top: 14px;
      left: 31px;
      box-sizing: border-box;
      overflow: hidden;
    }
    .url-bar {
      position: absolute;
      background: rgba(134, 223, 0, 0.83);
      width: 100%;
      height: 15px;
      box-shadow: inset 0 -3px rgba(163, 255, 0, 0.36);
      font-size: 10px;
      font-weight: bold;
      color: white;
      text-align: left;
      padding-left: 2px;
      box-sizing: border-box;
      text-shadow: 0 -1px rgba(0, 0, 0, 0.4);
      -webkit-transform: translateY(-16px);
    }
    .phone-page {
      width: 100%;
      height: 100%;
      opacity: 0;
    }
    .title {
      width: 44px;
      height: 15px;
      position: absolute;
      background: rgb(194, 255, 0);
      top: 8px;
      left: 50%;
      margin-left: -22px;
    }
    .input {
      position: absolute;
      top: 50%;
      left: 50%;
      background: #7ec255;
      color: transparent;
      font-size: 25px;
      font-weight: bold;
      width: 44px;
      height: 20px;
      margin-top: -10px;
      margin-left: -22px;
      box-sizing: border-box;
      text-align: center;
      border-radius: 4px;
      box-shadow: inset 0 5px #a6ff70;
      line-height: 60px;
      letter-spacing: 2px;
      text-shadow: 0 -1px transparent;
      border: 1px solid white;
    }

    .cursor {
      width: 2px;
      height: 8px;
      position: absolute;
      top: 7px;
      background: white;
      left: 4px;
    }
  }

  .arrow {
    position: absolute;
    top: 77px;
    left: 200px;
    width: 36px;
    background: url(../../../client_old/resources/images/arrow.png);
    height: 26px;
    background-repeat: no-repeat;
  }

  .url-box {
    top: 70px;
    left: 50%;
    background: #7ec255;
    color: white;
    font-size: 18px;
    width: 150px;
    height: 43px;
    box-sizing: border-box;
    text-align: center;
    border-radius: 4px;
    box-shadow: inset 0 -2px #a6ff70;
    line-height: 35px;
    margin-left: -75px;
    text-shadow: 0 -1px #207f26;
  }
  .token-box {
    top: 70px;
    left: 50%;
    background: #7ec255;
    color: transparent;
    font-size: 25px;
    font-weight: bold;
    width: 150px;
    height: 43px;
    box-sizing: border-box;
    text-align: center;
    border-radius: 4px;
    box-shadow: inset 0 -2px #a6ff70;
    line-height: 60px;
    letter-spacing: 2px;
    margin-left: -75px;
    text-shadow: 0 -1px transparent;
    border: 1px solid white;
  }

  /* Animate istructions page */

  .ai-lobby[state="showInfo"] .phone-img {
    -webkit-animation: phone-slide 400ms ease-out 0ms forwards;
    animation: phone-slide 400ms ease-out 0ms forwards;
  }
  .ai-lobby[state="showInfo"] .phone-img .url-bar {
    -webkit-animation: phone-url-bar-down 200ms ease-out 400ms forwards;
    animation: phone-url-bar-down 200ms ease-out 400ms forwards;
  }
  .ai-lobby[state="showInfo"] .arrow {
    opacity: 1;
    left: 122px;
    transition:
      left 250ms ease-out 550ms,
      opacity 100ms linear 550ms;
    -webkit-animation: arrow-shift 350ms ease-in-out 350ms alternate infinite;
    animation: arrow-shift 350ms ease-in-out 350ms alternate infinite;
  }

  .ai-lobby[state="showInfo"] .url-box {
    -webkit-animation: fade-in 200ms ease-out 350ms forwards;
    animation: fade-in 200ms ease-out 350ms forwards;
  }

  /* Animate token page */

  .ai-lobby[state="showToken"] .phone-img {
    -webkit-transform: translateX(-170px);
  }
  .ai-lobby[state="showToken"] .phone-img .url-bar {
    -webkit-animation: phone-url-bar-up 150ms ease-out 0ms forwards;
    animation: phone-url-bar-up 150ms ease-out 0ms forwards;
  }
  .ai-lobby[state="showToken"] .phone-img .phone-page {
    opacity: 1;
    transition: opacity 300ms ease-out 150ms;
  }
  .ai-lobby[state="showToken"] .phone-img .phone-page .cursor {
    -webkit-animation: fade-in 600ms linear 0ms alternate infinite;
    animation: fade-in 600ms linear 0ms alternate infinite;
  }
  .ai-lobby[state="showToken"] .arrow {
    left: 122px;
    opacity: 1;
    -webkit-animation: arrow-shift 350ms ease-in-out 350ms alternate infinite;
    animation: arrow-shift 350ms ease-in-out 350ms alternate infinite;
  }
  .ai-lobby[state="showToken"] .url-box {
    opacity: 0;
  }
  .ai-lobby[state="showToken"] .token-box {
    opacity: 1;
    -webkit-animation: token-box-fade-in 350ms ease-out 0ms forwards;
    animation: token-box-fade-in 350ms ease-out 0ms forwards;
  }

</style>

<template>
  <div id="lobby" class="ai-lobby" state="{{pageId}}">
    <div class="page-box">
      <div class="page">
        <div class="info">
          Sync your phone to your computer to start playing.
        </div>
        <div class="phone-img">
          <div class="viewport">
            <div class="url-bar">
              http://|
            </div>
            <div class="phone-page">
              <div class="title"></div>
              <div class="input">
                <div class="cursor"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="arrow"></div>
        <div class="url-box">all-in.aws.af.cm</div>
        <div id="token" class="token-box">{{token}}</div>
        <div id="nextBtn"
            v-if="isStartPage"
            @click="showInfo"
            class="button next">NEXT</div>
        <div id="nextBtn"
            v-if="isInfoPage"
            @click="getToken"
            class="button next"
            :class="{ 'disabled': isLoading }">NEXT</div>
        <div id="nextBtn"
            v-if="isTokenPage"
            @click="startGame"
            class="button next"
            :class="{ 'disabled': isWaiting }">START</div>
      </div>
    </div>
  </div>
</template>

<script>
  import { showInfo, getToken } from '../../vuex/host/actions'

  export default {
    computed: {
      isWaiting () {
        return this.pageId === 'showToken'
      },
      isStartPage () {
        return this.pageId !== 'showInfo' && this.pageId !== 'showToken'
      },
      isInfoPage () {
        return this.pageId === 'showInfo'
      },
      isTokenPage () {
        return this.pageId === 'showToken'
      }
    },
    vuex: {
      getters: {
        isLoading: (state) => state.game.isLoading,
        pageId: (state) => state.lobby.id,
        token: (state) => state.game.id
      },
      actions: {
        showInfo,
        getToken
      }
    }
  }

</script>
