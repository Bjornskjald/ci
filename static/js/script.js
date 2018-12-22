/* globals WebSocket FileReader location M */
const getPullRequestById = id => Array.from(document.querySelectorAll('.collection-item')).find(el => el.dataset.id === id.toString())
const getPullRequestElements = id => {
  const pr = getPullRequestById(id)
  return {
    status: pr.querySelector('.status'),
    statusIcon: pr.querySelector('.status > i'),
    refreshButton: pr.querySelector('.refresh-button'),
    tooltip: pr.querySelector('.tooltipped')
  }
}

const icons = {
  pending: 'brightness_1',
  success: 'check',
  failure: 'close',
  merged: 'done_all',
  closed: 'close'
}

const PullRequest = pr => `
<li data-id="${pr.id}" class="collection-item">
  <a href=${pr.url}>#${pr.id} - ${pr.name}</a>
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

function refreshButtonClickListener (ev) {
  const id = ev.target.parentNode.parentNode.parentNode.dataset.id
  window.currentRefreshId = id
  window.modal.open()
}

const ws = new WebSocket(`${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}`)
ws.onmessage = async message => {
  const text = await parseBlob(message.data)
  const json = JSON.parse(text)
  if (getPullRequestById(json.id)) {
    const { status, statusIcon, refreshButton } = getPullRequestElements(json.id)
    statusIcon.innerHTML = icons[json.status]
    status.dataset.tooltip = json.description || json.status
    if (json.status === 'merged') {
      refreshButton.removeEventListener('click', refreshButtonClickListener)
    }
  } else {
    const collection = document.querySelector('.collection')
    collection.innerHTML = PullRequest(json) + collection.innerHTML
    const { refreshButton, tooltip } = getPullRequestElements(json.id)
    M.Tooltip.init(tooltip)
    refreshButton.addEventListener('click', refreshButtonClickListener)
  }
}
