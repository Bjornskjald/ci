const agent = require('superagent')

module.exports = async (pr, state, description) => {
  const { head: { sha, repo: { full_name: name } } } = pr
  const { body } = await agent
    .post(`https://api.github.com/repos/${name}/statuses/${sha}`)
    .set({ Authorization: `Bearer ${global.token}` })
    .send({
      state,
      description,
      context: 'continuous-integration/miscord-ci'
    })
  return body
}
