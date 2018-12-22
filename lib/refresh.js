const checkReady = require('./checkReady')
const setStatus = require('./setStatus')

module.exports = (db, websockets) => async (req, res) => {
  if (!req.body || !req.body.password || !req.body.id) return res.code(400).send(new Error('Request body invalid'))
  if (req.body.password !== process.env.DASHBOARD_SECRET) return res.code(401).send(new Error('Wrong password!'))
  console.dir(req.body)
  const pr = (await db.find({ id: Number(req.body.id) }))[0]
  if (!pr) return res.code(400).send(new Error('Pull request not found!'))
  if (pr.status === 'merged') return res.code(400).send(new Error('Cannot refresh merged pull request!'))
  res.send('OK')
  const { id, name } = pr

  await setStatus(pr.body.pull_request, 'pending')
  websockets.sendStatus(id, name, 'pending')

  const checks = await checkReady()

  if (checks.npm && checks.changelog && checks.newVersion) {
    db.update({ id }, { ...pr, status: 'success' })
    setStatus(pr.body.pull_request, 'success')
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
  setStatus(pr.body.pull_request, 'failure', description)
  websockets.sendStatus(id, name, 'failure', description)
}
