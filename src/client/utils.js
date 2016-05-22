'use strict'

import Hashids from 'hashids'

const SEED = 'ABCDEFGHIJKLMNPQRSTUVWXYZ'
const hashids = new Hashids('Pwning Pwnies Total Pwnage', 5, SEED)

export const generateToken = () => {
  const d = new Date()
  return hashids.encode(parseInt(`1${d.getMinutes()}${d.getSeconds()}`, 10))
}
