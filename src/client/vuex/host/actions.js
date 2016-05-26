import db, { gameSchema } from '../../firebase/api.js'
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

const seats = {
  1: 'empty',
  2: 'empty',
  3: 'empty',
  4: 'empty'
}

let availableColors = {
  red: true,
  amber: true,
  green: true,
  blue: true,
  none: true
}

const initializeListeners = (dispatch, state, token) => {
  db.child(`games/${token}/players`).on('child_added', (data) => {
    // NOTE: child_added triggered for already processed players...
    // got to do something to avoid duplicates
    const player = data.val()
    const key = data.key
    if (!player || state.game.players.length === 4 ||
        state.game.players.find(p => p.id === key)) {
      return
    }
    const freeSeat = Object.keys(seats).filter(k =>
        seats[k] === 'empty')[0]
    player.id = key
    player.nickname = `Player ${freeSeat}`
    player.cash = 10000
    player.state = 'customizing'
    player.availableColors = availableColors

    seats[freeSeat] = key

    db.child(`games/${token}/seats/${freeSeat}`).set(player.id)

    db.child(`games/${token}/players/${key}`).update(player).then(() => {
      console.log('update', key)
      dispatch('PLAYER_JOINED', player)
    })

    db.child(`games/${token}/players/${key}/color`).on('value', (data) => {
      console.log('on color', key, data.val())
      if (!data.val()) return
      const p = state.game.players.find(p => p.id === key)

      db.child('games').transaction(games => {
        console.log('transaction color', games, key, data.val())
        if (!games) return {}
        if (!games[token].colors) {
          games[token].colors = {
            red: true,
            amber: true,
            green: true,
            blue: true,
            none: true
          }
          // return games
        }
        const colors = games[token].colors
        if (p.color !== 'none') {
          colors[p.color] = true
        }
        if (data.val() !== 'none') {
          colors[data.val()] = false
        }
        Object.keys(games[token].players).forEach(k => {
          games[token].players[k].availableColors = colors
        })

        availableColors = colors

        return games
      })

      dispatch('PLAYER_COLOR_UPDATE', key, data.val())
    })

    db.child(`games/${token}/players/${key}/nickname`).on('value', (data) => {
      dispatch('PLAYER_NICKNAME_UPDATE', key, data.val())
    })
  })
}
