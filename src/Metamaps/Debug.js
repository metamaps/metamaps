const Debug = function(arg = window.Metamaps) {
  if (arg === undefined && typeof window !== 'undefined') arg = window.Metamaps
  console.log(arg)
  console.log(`Metamaps Version: ${arg.ServerData.VERSION}`)
  console.log(`Build: ${arg.ServerData.BUILD}`)
  console.log(`Last Updated: ${arg.ServerData.LAST_UPDATED}`)
}

export default Debug
