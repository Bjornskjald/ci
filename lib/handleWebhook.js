const crypto = require('crypto')
const checkReady = require('./checkReady')
const setStatus = require('./setStatus')

const generateJWT = require('./generateJWT')
const getInstallationToken = require('./getInstallationToken')

let jwt = generateJWT()
let token
getInstallationToken(jwt).then(_token => { token = _token })
setInterval(() => { jwt = generateJWT() }, 5 * 60 * 1000)
setInterval(async () => { token = await getInstallationToken(jwt) }, 10 * 60 * 1000)

const genSig = body => 'sha1=' + crypto.createHmac('sha1', process.env.WEBHOOK_SECRET).update(JSON.stringify(body)).digest('hex')

module.exports = (db, websockets) => async (req, res) => {
  if (genSig(req.body) !== req.headers['x-hub-signature']) return res.code(401).type('application/json').send(new Error('Webhook secret check failed'))
  res.send('OK')
  console.dir(req.body, { depth: 1 })

  if (req.headers['x-github-event'] !== 'pull_request') return console.log('It\'s not a pull request, ignoring.')

  const { number: id, pull_request: { title: name, base: { ref } } } = req.body
  if (ref !== 'master') return console.log('It\'s not a pull request to master, ignoring.')

  const existing = await db.find({ id })
  const pr = {
    id,
    name,
    status: 'pending'
  }
  if (!existing.length) {
    await db.insert(pr)
  }

  if (req.body.action === 'closed') {
    websockets.sendStatus(id, name, 'merged')
    console.log('PR is being closed, ignoring.')
    return
  }

  await setStatus(req.body.pull_request, token, 'pending')
  websockets.sendStatus(id, name, 'pending')

  // const checks = await checkReady()
  const checks = {
    npm: true,
    changelog: true,
    newVersion: false
  }

  if (checks.npm && checks.changelog && checks.newVersion) {
    db.update({ id }, { ...pr, status: 'success' })
    setStatus(req.body.pull_request, token, 'success')
    websockets.sendStatus(id, name, 'success')
    return
  }

  const failed = [
    checks.npm ? null : 'NPM',
    checks.changelog ? null : 'changelog',
    checks.newVersion ? null : 'version increment'
  ].filter(e => e)

  const description = 'Failed checks: ' + failed.join(', ')
  db.update({ id }, { ...pr, status: 'failure', description })
  setStatus(req.body.pull_request, token, 'failure', description)
  websockets.sendStatus(id, name, 'failure', description)
}
