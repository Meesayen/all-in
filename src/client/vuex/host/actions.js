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

const seats = {
  1: 'empty',
  2: 'empty',
  3: 'empty',
  4: 'empty'
}

const initializeListeners = (dispatch, state, token) => {
  db.child(`games/${token}/players`).on('child_added', (data) => {
    const player = data.val()
    const key = data.key
    if (!player || state.game.players.length === 4) {
      return
    }
    const freeSeat = Object.keys(seats).filter(k =>
        seats[k] === 'empty')[0]
    player.id = key
    player.nickname = `Player ${freeSeat}`
    player.cash = 10000
    player.state = 'customizing'
    seats[freeSeat] = key

    db.child(`games/${token}/seats/${freeSeat}`).set(player.id)
    db.child(`games/${token}/players/${key}`).update(player).then(() => {
      dispatch('PLAYER_JOINED', player)
    })

    db.child(`games/${token}/players/${key}/color`).on('value', (data) => {
      const p = state.game.players.find(p => p.id === key)
      db.child(`games`).transaction(games => {
        const colors = games[token].colors
        if (data.val() !== 'none') {
          colors[data.val()] = false
        }
        if (p.color !== 'none') {
          colors[p.color] = true
        }
        Object.keys(games[token].players).forEach(k => {
          games[token].players[k].availableColors = colors
        })
        return games
      })

      dispatch('PLAYER_COLOR_UPDATE', key, data.val())
    })


    db.child(`games/${token}/players/${key}/nickname`).on('value', (data) => {
      // console.log(data, data.val())
    })

    const c = ['red', 'green', 'amber', 'blue', 'none']
    const getI = () => Math.floor(Math.random() * 5)
    setTimeout(() => {
      changeColor(token, key, c[getI()])
    }, 1000)

    setTimeout(() => {
      changeColor(token, key, c[getI()])
    }, 2000)

    setTimeout(() => {
      changeColor(token, key, c[getI()])
    }, 3000)

    setTimeout(() => {
      changeColor(token, key, c[getI()])
    }, 4000)

    setTimeout(() => {
      changeColor(token, key, c[getI()])
    }, 4100)

    setTimeout(() => {
      changeColor(token, key, c[getI()])
    }, 4200)

    setTimeout(() => {
      changeColor(token, key, c[getI()])
    }, 4300)
    setTimeout(() => {
      changeColor(token, key, c[getI()])
    }, 4320)
    setTimeout(() => {
      changeColor(token, key, c[getI()])
    }, 4340)
    setTimeout(() => {
      changeColor(token, key, c[getI()])
    }, 4360)
    setTimeout(() => {
      changeColor(token, key, c[getI()])
    }, 4320)
    setTimeout(() => {
      changeColor(token, key, c[getI()])
    }, 4340)
    setTimeout(() => {
      changeColor(token, key, c[getI()])
    }, 4360)
    setTimeout(() => {
      changeColor(token, key, c[getI()])
    }, 4320)
    setTimeout(() => {
      changeColor(token, key, c[getI()])
    }, 4340)
    setTimeout(() => {
      changeColor(token, key, c[getI()])
    }, 4360)
    setTimeout(() => {
      changeColor(token, key, c[getI()])
    }, 4320)
    setTimeout(() => {
      changeColor(token, key, c[getI()])
    }, 4340)
    setTimeout(() => {
      changeColor(token, key, c[getI()])
    }, 4360)
    setTimeout(() => {
      changeColor(token, key, c[getI()])
    }, 4320)
    setTimeout(() => {
      changeColor(token, key, c[getI()])
    }, 4340)
    setTimeout(() => {
      changeColor(token, key, c[getI()], true)
    }, 5360)
  })

  setTimeout(() => {
    db.child(`games/${token}/players`).push().set(playerSchema)
  }, 1000)
  setTimeout(() => {
    db.child(`games/${token}/players`).push().set(playerSchema)
  }, 1005)
  setTimeout(() => {
    db.child(`games/${token}/players`).push().set(playerSchema)
  }, 1025)
  setTimeout(() => {
    db.child(`games/${token}/players`).push().set(playerSchema)
  }, 1205)
}

const changeColor = (token, key, color, takeAvailable) => {
  db.child(`games/${token}/players/${key}`).transaction(player => {
    if (takeAvailable) {
      const c = Object.keys(player.availableColors).filter(k =>
          player.availableColors[k] && k !== 'none')[0]
      player.availableColors[c] = false
      player.color = c
      return player
    }
    if (!player) return
    if (!player.availableColors[color]) return
    player.availableColors[color] = false
    player.color = color
    return player
  }, (err, com, snap) => {
    // TODO: Rollback Guest UI Color Selection if !com
  })
}
