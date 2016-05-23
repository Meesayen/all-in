import firebase from 'firebase'

const config = {
  apiKey: 'AIzaSyBCSy3vdwIL2NG8Q79KK-OMM3t-IxFPPrI',
  authDomain: 'all-in-a41b1.firebaseapp.com',
  databaseURL: 'https://all-in-a41b1.firebaseio.com',
  storageBucket: 'all-in-a41b1.appspot.com'
}

firebase.initializeApp(config)

export const gameSchema = {
  state: 'lobby',
  pot: 0,
  cards: null,
  players: null,
  colors: {
    red: true,
    amber: true,
    green: true,
    blue: true,
    none: true
  },
  seats: {
    1: 'empty',
    2: 'empty',
    3: 'empty',
    4: 'empty'
  }
}

export const playerSchema = {
  state: '',
  nickname: 'Player',
  active: false,
  cash: 0,
  bet: 0,
  order: 1,
  cards: null,
  color: 'none',
  availableColors: {
    red: true,
    amber: true,
    green: true,
    blue: true,
    none: true
  }
}

export default firebase.database().ref()
