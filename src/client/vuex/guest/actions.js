import db, { playerSchema } from '../../firebase/api.js'

export const joinGameSession = (token) => {
  db.child('games').transaction(games => {
    console.log(games)

    if (!games) return {}
    if (!games[token]) return
    if (games[token].players &&
        Object.keys(games[token].players).length === 4) return
    return games
  }, (err, com, snap) => {
    console.log(com)
    if (com) {
      db.child(`games/${token}/players`).push().set(playerSchema)
    }
    // TODO: Rollback Guest UI Color Selection if !com
  })
}
