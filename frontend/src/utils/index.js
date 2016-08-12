export const objectWithoutProperties = (obj, keys) => {
  const target = {}
  for (let i in obj) {
    if (keys.indexOf(i) !== -1) continue
    if (!Object.prototype.hasOwnProperty.call(obj, i)) continue
    target[i] = obj[i]
  }
  return target
}
