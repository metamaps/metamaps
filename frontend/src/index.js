import React from 'react'
import ReactDOM from 'react-dom'
import Backbone from 'backbone'
import _ from 'underscore'

import Metamaps from './Metamaps'

// create global references to some libraries
window.React = React
window.ReactDOM = ReactDOM
Backbone.$ = window.$ // jquery from rails
window.Backbone = Backbone
window._ = _

window.Metamaps = Metamaps
