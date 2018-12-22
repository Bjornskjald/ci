/* globals WebSocket FileReader location M */
const getPullRequestById = id => Array.from(document.querySelectorAll('.collection-item')).find(el => el.dataset.id === id.toString())

const icons = {
  pending: 'brightness_1',
  success: 'check',
  failure: 'close',
  merged: 'done_all'
}

const PullRequest = pr => `
<li data-id="${pr.id}" class="collection-item">
  #${pr.id} - ${pr.name}
  <div class="secondary-content">
    <a class="status tooltipped" data-position="top" data-tooltip="${pr.description || pr.status}">
      <i class="material-icons">${icons[pr.status]}</i>
    </a>
    <a href="#!" class="refresh-button">
      <i class="material-icons">refresh</i>
    </a>
  </div>
</li>
`

function parseBlob (blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.addEventListener('loadend', e => resolve(e.srcElement.result))
    reader.readAsText(blob)
  })
}

const ws = new WebSocket('ws://' + location.host)
ws.onmessage = async message => {
  const text = await parseBlob(message.data)
  const json = JSON.parse(text)
  if (getPullRequestById(json.id)) {
    const status = getPullRequestById(json.id).querySelector('.status')
    status.querySelector('i').innerHTML = icons[json.status]
    status.dataset.tooltip = json.description || json.status
  } else {
    document.querySelector('.collection').innerHTML += PullRequest(json)
    const newTooltip = getPullRequestById(json.id).querySelector('.tooltipped')
    M.Tooltip.init(newTooltip)
  }
}
