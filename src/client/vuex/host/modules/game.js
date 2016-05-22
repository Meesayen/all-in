const state = {
  id: '',
  isLoading: false
}

const mutations = {
  'TOGGLE_LOADING' (state, flag) {
    state.isLoading = flag || !state.isLoading
  },

  'TOKEN_GENERATED' (state, token) {
    state.id = token
  }
}

export default {
  state,
  mutations
}
