class WSClientArray extends Array {
  sendStatus (id, name, url, status, description) {
    this.broadcast({
      id,
      name,
      url,
      status,
      description
    })
  }

  broadcast (data) {
    this.forEach(client => {
      client.write(JSON.stringify(data))
    })
  }

  push (item) {
    super.push(item)
    item.addListener('close', () => {
      this.splice(this.indexOf(item), 1)
    })
  }
}
module.exports = WSClientArray
