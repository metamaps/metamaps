import React from 'react'
import ReactDOM from 'react-dom'
import Backbone from 'backbone'
import _ from 'underscore'
import Maps from './components/Maps.js'

// this is optional really, if we import components directly React will be
// in the bundle, so we won't need a global reference
window.React = React
window.ReactDOM = ReactDOM
Backbone.$ = window.$
window.Backbone = Backbone
window._ = _

window.Metamaps = window.Metamaps || {}
window.Metamaps.ReactComponents = {
  Maps
}
