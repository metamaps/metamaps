import { combineReducers } from 'redux'

import filters from './filters'
import selected from './selected'
import chat from './chat'
import createTopic from './createTopic'
import createSynapse from './createSynapse'
import contextMenu from './contextMenu'
import topicCard from './topicCard'
import synapseCard from './synapseCard'
import realtime from './realtime'
import settings from './settings'
import importDialogue from './importDialogue'
import layout from './layout'
import mouse from './mouse'
import metacodeSelect from './metacodeSelect'

export default combineReducers({
  chat,
  filters,
  selected,
  createTopic,
  createSynapse,
  contextMenu,
  topicCard,
  synapseCard,
  realtime,
  settings,
  importDialogue,
  layout,
  mouse,
  metacodeSelect
})
