require('dotenv').config()
const fastify = require('fastify')
const path = require('path')
const marko = require('marko')
const WSClientArray = require('./lib/WSClientArray')
const Datastore = require('nedb-promises')
// const db = Datastore.create({
//   filename: 'pull_requests.db',
//   autoload: true
// })
const db = Datastore.create()

let websocketClients = new WSClientArray()

const app = fastify()
app.register(require('fastify-websocket'), {
  handle: conn => websocketClients.push(conn)
})
app.register(require('point-of-view'), {
  engine: { marko },
  templates: 'templates'
})
app.register(require('fastify-static'), {
  root: path.join(__dirname, 'static', 'js'),
  prefix: '/js/'
})
app.get('/', async (req, res) => {
  res.header('Content-Security-Policy', `default-src 'self' https: wss: 'unsafe-inline';`)
  res.view('index.marko', {
    pullRequests: await db.find({})
  })
})
app.post('/webhook', require('./lib/handleWebhook')(db, websocketClients))
app.listen(5500, () => console.log('I\'m listening!'))
