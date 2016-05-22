const state = {
  state: 'lobby',
  id: '',
  isLoading: false,
  players: [ ],
  cards: [ ],
  colors: {
    red: true,
    amber: true,
    green: true,
    blue: true
  },
  seats: {
    1: 'empty',
    2: 'empty',
    3: 'empty',
    4: 'empty'
  },
  pot: 0
}

const mutations = {
  'TOGGLE_LOADING' (state, flag) {
    state.isLoading = flag || !state.isLoading
  },

  'TOKEN_GENERATED' (state, token) {
    state.id = token
  },

  'PLAYER_JOINED' (state, player, seat) {
    state.players.push(player)
    state.seats[seat] = player.id
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
