const tmp = require('tmp')
const path = require('path')
const { Clone } = require('nodegit')
const fs = require('fs-extra')
const latestVersion = require('latest-version')
const parseChangelog = require('changelog-parser')

module.exports = async () => {
  const dir = tmp.dirSync()
  await Clone.clone('https://github.com/miscord/miscord', dir.name, { checkoutBranch: 'dev' })
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
