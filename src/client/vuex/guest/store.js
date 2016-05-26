import Vue from 'vue'
import Vuex from 'vuex'

// Make vue aware of Vuex
Vue.use(Vuex)

// Create an object to hold the initial state when
// the app starts up
const state = {
  state: 'limbo',
  nickname: 'Player',
  active: false,
  cash: 0,
  bet: 0,
  order: 1,
  cards: null,
  color: 'none',
  availableColors: {
    red: true,
    amber: true,
    green: true,
    blue: true,
    none: true
  }
}

// Create an object storing various mutations. We will write the mutation
const mutations = {
  'UPDATE_STATE' (state, val) {
    state.state = val
  },
  'UPDATE_COLOR' (state, val) {
    state.color = val
  },
  'UPDATE_AVAILABLE_COLORS' (state, val) {
    state.availableColors = val
  },
  'UPDATE_NICKNAME' (state, val) {
    state.nickname = val
  }
}

// Combine the initial state and the mutations to create a Vuex store.
// This store can be linked to our app.
export default new Vuex.Store({
  state,
  mutations
})
