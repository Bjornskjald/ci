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
  const pkg = require(path.join(dir.name, 'package.json'))
  const npmVersion = await latestVersion('miscord')
  console.dir(pkg.version)
  const changelog = await parseChangelog(path.join(dir.name, 'CHANGELOG.md'))
  await fs.remove(dir.name)
  return {
    npm: pkg.version === npmVersion,
    changelog: npmVersion === changelog.versions[0].version
  }
}
