function fetchWithCookies(url) {
  return fetch(url, { credentials: 'same-origin' })
}

function postWithCookies(url, data = {}) {
  return fetch(url, {
    credentials: 'same-origin',
    method: 'POST',
    body: JSON.stringify(data)
  })
}

async function getMetacodes() {
  const res = await fetchWithCookies('/metacodes.json')
  const data = await res.json()
  return data
}

async function getMetacodeSets() {
  const res = await fetchWithCookies('/metacode_sets.json')
  const data = await res.json()
  return data
}

async function getCurrentUser() {
  const res = await fetchWithCookies('/users/current.json')
  const data = await res.json()
  return data
}

async function approveAccessRequest(mapId, requestId) {
  const res = await postWithCookies(`/maps/${mapId}/approve_access/${requestId}`)
  return res.status === 200
}

async function denyAccessRequest(mapId, requestId) {
  const res = await postWithCookies(`/maps/${mapId}/deny_access/${requestId}`)
  return res.status === 200
}

async function requestAccess(mapId) {
  const res = await postWithCookies(`/maps/${mapId}/access_request`)
  return res.status === 200
}

module.exports = {
  getMetacodes,
  getMetacodeSets,
  getCurrentUser,
  approveAccessRequest,
  denyAccessRequest,
  requestAccess
}