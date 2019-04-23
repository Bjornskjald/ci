const setStatus = require('./setStatus')

module.exports = (db, pr, websockets) => async (status, description, skipGithub) => {
  const { id } = pr
  await db.update(
    { id },
    description ? {
      $set: { status, description }
    } : {
      $set: { status },
      $unset: { description: true }
    }
  )
  if (!skipGithub) await setStatus(pr, status, description)
  websockets.sendStatus(pr, status, description)
}
