import {} from 'jquery-ujs'
// make changes to Backbone before loading Metamaps code
import Backbone from 'backbone'
try { Backbone.$ = window.$ } catch (err) {}
Backbone.ajax = (opts) => window.$.ajaxq('backbone-ajaxq', opts)

import _ from 'lodash'
import Metamaps from './Metamaps'

// create global references
window._ = _
window.Metamaps = Metamaps
