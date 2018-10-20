const agent = require('superagent')

module.exports = async (name, sha, token, state, message) => {
  const { body } = await agent
    .post(`https://api.github.com/repos/${name}/statuses/${sha}`) // eslint-disable-line camelcase
    .set({ Authorization: `Bearer ${token}` })
    .send({
      state,
      message,
      context: 'continuous-integration/miscord-ci'
    })
  return body
}
