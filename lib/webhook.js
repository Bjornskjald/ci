const crypto = require('crypto')
const checkReady = require('./checkReady')
const _update = require('./update')

const genSig = body => 'sha1=' + crypto.createHmac('sha1', process.env.WEBHOOK_SECRET).update(JSON.stringify(body)).digest('hex')

module.exports = (db, websockets) => async (req, res) => {
  if (genSig(req.body) !== req.headers['x-hub-signature']) return res.code(401).type('application/json').send(new Error('Webhook secret check failed'))
  res.send('OK')
  console.dir(req.body, { depth: 1 })

  if (req.headers['x-github-event'] !== 'pull_request') return console.log('It\'s not a pull request, ignoring.')

  const {
    number: id,
    pull_request: {
      html_url: url,
      merged,
      title: name,
      base: { ref },
      head
    },
    action
  } = req.body

  if (ref !== 'master') return console.log('It\'s not a pull request to master, ignoring.')

  const existing = await db.find({ id })
  const pr = {
    id,
    name,
    url,
    status: 'pending',
    meta: {
      sha: head.sha,
      repo: {
        full_name: head.repo.full_name
      }
    }
  }
  if (!existing.length) {
    await db.insert(pr)
  }
  const update = _update(db, pr, websockets)

  if (action === 'closed') {
    await update(merged ? 'merged' : 'closed', null, true)
    console.log('PR is being closed, ignoring.')
    return
  }

  await update('pending')

  const { success, description } = await checkReady()

  if (success) {
    await update('success')
    return
  }
  await update('failure', description)
}
