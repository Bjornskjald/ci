const tmp = require('tmp')
const path = require('path')
const git = require('isomorphic-git')
const fs = require('fs-extra')
const latestVersion = require('latest-version')
const parseChangelog = require('changelog-parser')
git.plugins.set('fs', fs)

module.exports = async () => {
  const dir = tmp.dirSync()
  await git.clone({ dir: dir.name, url: 'https://github.com/miscord/miscord' })
  const current = await git.currentBranch({ dir: dir.name })

  if (current !== 'dev') await git.checkout({ dir: dir.name, ref: 'dev' })
  const { version: dev } = require(path.join(dir.name, 'package.json'))

  delete require.cache[require.resolve(path.join(dir.name, 'package.json'))]

  await git.checkout({ dir: dir.name, ref: 'master' })
  const { version: master } = require(path.join(dir.name, 'package.json'))

  const npm = await latestVersion('miscord')
  const { version: changelog } = (await parseChangelog(path.join(dir.name, 'CHANGELOG.md'))).versions[0]

  await fs.remove(dir.name)

  console.dir({
    dev,
    master,
    npm,
    changelog
  })

  return {
    newVersion: dev !== master,
    npm: dev === npm,
    changelog: dev === changelog
  }
}
