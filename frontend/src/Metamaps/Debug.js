const Debug = function(arg = window.Metamaps) => {
  if (arg === undefined && typeof window !== 'undefined') arg = window.Metamaps
  console.debug(arg)
  console.debug(`Metamaps Version: ${arg.ServerData.VERSION}`)
  console.debug(`Build: ${arg.ServerData.BUILD}`)
  console.debug(`Last Updated: ${arg.ServerData.LAST_UPDATED}`)
}

export default Debug
