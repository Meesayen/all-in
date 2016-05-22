import db, { gameSchema, playerSchema } from '../../firebase/api.js'
import { generateToken } from '../../utils.js'

export const showInfo = ({ dispatch, state }) => {
  dispatch('SHOW_INFO')
}

export const getToken = ({ dispatch, state }) => {
  const token = generateToken()
  dispatch('TOGGLE_LOADING')
  db.child(`games/${token}`).set(gameSchema).then(() => {
    initializeListeners(dispatch, state, token)
    dispatch('TOKEN_GENERATED', token)
    dispatch('TOGGLE_LOADING')
  })
}

const initializeListeners = (dispatch, state, token) => {
  db.child(`games/${token}/players`).on('child_added', (data) => {
    const player = data.val()
    const key = data.key
    if (!player || state.game.players.length === 4) {
      return
    }
    const freeSeat = Object.keys(state.game.seats).filter(k =>
        state.game.seats[k] === 'empty')[0]
    player.id = `player${freeSeat}`
    player.nickname = `Player ${freeSeat}`
    player.cash = 10000
    player.state = 'customizing'

    db.child(`games/${token}/players/${key}`).update(player).then(() => {
      dispatch('PLAYER_JOINED', player, freeSeat)
    })

    // TODO: Sync colors and seats on firebase
  })

  setTimeout(() => {
    db.child(`games/${token}/players`).push().set(playerSchema)
  }, 1000)
}
