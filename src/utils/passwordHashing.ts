const bcrypt = require('bcrypt');
const saltRounds = 10;

export const generate =  async (password) => {
  if(!password) {
    return null
  }
  const hash = await bcrypt.hash(password, saltRounds, function(err, hash) {
    if(err) {
      console.log(err);
      return;
    }
    return hash
  });
  return hash;
}

export const compare = async (password, hash) => {
  return await bcrypt.compare(password, hash);
}