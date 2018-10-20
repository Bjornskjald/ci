const agent = require('superagent')

module.exports = async (name, sha, token, state, description) => {
  const { body } = await agent
    .post(`https://api.github.com/repos/${name}/statuses/${sha}`) // eslint-disable-line camelcase
    .set({ Authorization: `Bearer ${token}` })
    .send({
      state,
      description,
      context: 'continuous-integration/miscord-ci'
    })
  return body
}
