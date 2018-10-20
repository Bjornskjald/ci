const agent = require('superagent')

module.exports = async jwt => {
  const { body: installations } = await agent
    .get('https://api.github.com/app/installations')
    .set({ Authorization: `Bearer ${jwt}` })
    .set({ Accept: 'application/vnd.github.machine-man-preview+json' })
  const miscord = installations.find(installation => installation.account.login === 'miscord')
  const { body: { token } } = await agent
    .post(`https://api.github.com/app/installations/${miscord.id}/access_tokens`)
    .set({ Authorization: `Bearer ${jwt}` })
    .set({ Accept: 'application/vnd.github.machine-man-preview+json' })
  return token
}
