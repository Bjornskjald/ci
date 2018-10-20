require('dotenv').config()
const express = require('express')
const crypto = require('crypto')
const generateJWT = require('./generateJWT')
const getInstallationToken = require('./getInstallationToken')
const checkReady = require('./checkReady')
const setStatus = require('./setStatus')

const genSig = body => 'sha1=' + crypto.createHmac('sha1', process.env.WEBHOOK_SECRET).update(JSON.stringify(body)).digest('hex')

let jwt = generateJWT()
let token
getInstallationToken(jwt).then(_token => { token = _token })
setInterval(() => { jwt = generateJWT() }, 5 * 60 * 1000)
setInterval(async () => { token = await getInstallationToken(jwt) }, 10 * 60 * 1000)

const app = express()
app.use(express.json())
app.get('/', (req, res) => res.send('work in progress...'))
app.post('/webhook', async (req, res) => {
  console.dir(req.body)
  if (genSig(req.body) !== req.headers['x-hub-signature']) return res.sendStatus(401)
  res.sendStatus(200)
  if (req.headers['x-github-event'] !== 'pull_request') return
  const { head: { sha, repo: { full_name } }, base: { ref } } = req.body.pull_request // eslint-disable-line camelcase
  if (ref !== 'master') return
  await setStatus(full_name, sha, token, 'pending')
  const checks = await checkReady()
  if (checks.npm && checks.changelog) return setStatus(full_name, sha, token, 'success')
  const failed = [ checks.npm ? 'NPM' : null, checks.changelog ? 'changelog' : null ].filter(e => e)
  setStatus(full_name, sha, token, 'failed', 'Failed checks: ' + failed.join(', '))
})
app.listen(5500, () => console.log('I\'m listening!'))
