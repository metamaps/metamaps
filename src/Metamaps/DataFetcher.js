
async function getMetacodes() {
  const res = await fetch('/metacodes.json')
  const data = await res.json()
  return data
}

module.exports = {
  getMetacodes
}