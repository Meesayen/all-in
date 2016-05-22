export const showInfo = ({ dispatch, state }) => {
  dispatch('SHOW_INFO')
}

export const getToken = ({ dispatch, state }) => {
  // TODO: Call Firebase API
  dispatch('TOGGLE_LOADING')
  setTimeout(() => {
    dispatch('TOKEN_GENERATED', 'LWKZP')
    dispatch('TOGGLE_LOADING')
  }, 1500)
}
