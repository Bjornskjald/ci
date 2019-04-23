const checkReady = require('./checkReady')
const _update = require('./update')

module.exports = (db, websockets) => async (req, res) => {
  if (!req.body || !req.body.password || !req.body.id) return res.code(400).send(new Error('Request body invalid'))
  if (req.body.password !== process.env.DASHBOARD_SECRET) return res.code(401).send(new Error('Wrong password!'))
  console.dir(req.body)
  const pr = (await db.find({ id: Number(req.body.id) }))[0]
  if (!pr) return res.code(400).send(new Error('Pull request not found!'))
  if (pr.status === 'merged') return res.code(400).send(new Error('Cannot refresh merged pull request!'))
  res.send('OK')

  const update = _update(db, pr, websockets)

  await update('pending')

  const { success, description } = await checkReady()

  if (success) {
    await update('success')
    return
  }
  await update('failure', description)
}
