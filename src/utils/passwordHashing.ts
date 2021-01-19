const bcrypt = require('bcrypt');
const saltRounds = 10;

export const generate =  async (password) => {
  if (!password) {
    return null
  }
  return bcrypt.hashSync(password, saltRounds)
}

export const compare = async (password, hash) => {
  return bcrypt.compareSync(password, hash)
}