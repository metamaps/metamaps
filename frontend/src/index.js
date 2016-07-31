import React from 'react'
import ReactDOM from 'react-dom'
import ExploreHeader from './components/ExploreHeader.js'

// this is optional really, if we import components directly React will be 
// in the bundle, so we won't need a global reference
window.React = React
window.ReactDOM = ReactDOM

window.Metamaps = window.Metamaps || {}
window.Metamaps.ReactComponents = {
  ExploreHeader
}
