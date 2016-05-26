import { db, playerSchema } from '../../firebase/api.js'
import store from './store.js'

let playerRef = null

export const joinGameSession = (token) => {
  db.ref('games').transaction(games => {
    if (!games) return {}
    if (!games[token]) return
    if (games[token].players &&
        Object.keys(games[token].players).length === 4) return
    return games
  }, (err, com, snap) => {
    if (!err && com) {
      playerRef = db.ref(`games/${token}/players`).push()
      playerRef.set(playerSchema)
      setPlayerListeners(playerRef)
    }
  })
}

const setPlayerListeners = (ref) => {
  // NOTE: Is it better an .on() for each state prop or
  // would it be better a single .on() on the whole player ref?
  ref.child('state').on('value', snap => {
    if (snap.val()) {
      store.dispatch('UPDATE_STATE', snap.val())
    }
  })
  ref.child('color').on('value', snap => {
    if (snap.val()) {
      store.dispatch('UPDATE_COLOR', snap.val())
    }
  })
  ref.child('nickname').on('value', snap => {
    if (snap.val()) {
      store.dispatch('UPDATE_NICKNAME', snap.val())
    }
  })
  ref.child('availableColors').on('value', snap => {
    if (snap.val()) {
      store.dispatch('UPDATE_AVAILABLE_COLORS', snap.val())
    }
  })
}

export const updateColor = (color, takeAvailable) => {
  playerRef.transaction(player => {
    if (!player) return {}
    if (!player.availableColors[color]) return
    player.availableColors[color] = false
    player.color = color
    return player
  })
}

export const updateNickname = (nickname) => {
  playerRef.transaction(player => {
    if (!player) return {}
    player.nickname = nickname
    return player
  })
}
