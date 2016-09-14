/*
 * Metamaps.Debug.js.erb
 *
 * Dependencies: none!
 */

Metamaps.Debug = function () {
  console.debug(Metamaps)
  console.debug('Metamaps Version: ' + Metamaps.VERSION)
}
Metamaps.debug = function () {
  Metamaps.Debug()
}
