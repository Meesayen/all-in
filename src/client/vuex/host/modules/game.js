const state = {
  state: 'lobby',
  id: '',
  isLoading: false,
  players: [ ],
  cards: [ ],
  pot: 0
}

const mutations = {
  'TOGGLE_LOADING' (state, flag) {
    state.isLoading = flag || !state.isLoading
  },

  'TOKEN_GENERATED' (state, token) {
    state.id = token
  },

  'PLAYER_JOINED' (state, player) {
    state.players.push(player)
  },

  'PLAYER_COLOR_UPDATE' (state, id, color) {
    state.players.find(p => p.id === id).color = color
  }
}

export default {
  state,
  mutations
}


// player
// {
//   id: 'player1',
//   active: true,
//   nickname: 'Ferdinand',
//   cash: 10000,
//   bet: 1000,
//   state: 'customizing',
//   color: '',
//   order: 1,
// }

// const PLAYER_STATES = {
//   IDLE: 0,
//   READY: 1,
//   WAITING: 2,
//   THINKING: 3,
//   SMALL_BLIND: 5,
//   BIG_BLIND: 6,
//   FOLD: 7,
//   RAISE: 9,
//   CALL: 10,
//   BROKE: 11,
//   CHECK: 12
// };
