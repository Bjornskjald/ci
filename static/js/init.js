/* globals M refreshButtonClickListener fetch alert */
document.addEventListener('DOMContentLoaded', () => {
  M.Tooltip.init(document.querySelectorAll('.tooltipped'))
  M.Modal.init(document.querySelectorAll('.modal'))
  const refreshButtons = Array.from(document.querySelectorAll('.refresh-button'))
  refreshButtons
    .filter(el => el.parentNode.querySelector('.status').dataset.tooltip !== 'merged')
    .forEach(button => button.addEventListener('click', refreshButtonClickListener))
  window.modal = M.Modal.getInstance(document.querySelector('#modal'))
  document.querySelector('#modal-submit').addEventListener('click', modalSubmitClickListener)
})

function modalSubmitClickListener () {
  document.querySelector('#modal-submit').classList.add('disabled')
  fetch('/refresh', {
    method: 'POST',
    body: JSON.stringify({
      id: window.currentRefreshId,
      password: document.querySelector('#password').value
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(async res => {
    document.querySelector('#modal-submit').classList.remove('disabled')
    if (res.status !== 200) alert((await res.json()).message)
    window.modal.close()
  })
}
