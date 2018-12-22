require('dotenv').config()
const fs = require('fs-extra')
const jwt = require('jsonwebtoken')

module.exports = () => {
  const privkey = fs.readFileSync(process.env.PRIVATE_KEY_PATH, 'utf8')
  const time = Math.floor(Date.now() / 1000)
  const payload = {
    iat: time,
    exp: time + 10 * 60,
    iss: process.env.GITHUB_APP_ID
  }
  // console.log(jwt.sign(payload, privkey, { algorithm: 'RS256' }))
  return jwt.sign(payload, privkey, { algorithm: 'RS256' })
}
