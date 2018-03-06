function fetchWithCookies(url) {
  return fetch(url, { credentials: 'same-origin' })
}

async function getMetacodes() {
  const res = await fetchWithCookies('/metacodes.json')
  const data = await res.json()
  return data
}

async function getCurrentUser() {
  const res = await fetchWithCookies('/users/current.json')
  const data = await res.json()
  return data
}

module.exports = {
  getMetacodes,
  getCurrentUser
}