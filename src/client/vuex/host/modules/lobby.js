const state = {
  id: ''
}

const mutations = {
  'SHOW_INFO' (state) {
    state.id = 'showInfo'
  },

  'TOKEN_GENERATED' (state) {
    state.id = 'showToken'
  }
}

export default {
  state,
  mutations
}
