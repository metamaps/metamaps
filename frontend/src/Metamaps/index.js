/* global Metamaps */

import Account from './Account'
import Active from './Active'
import Admin from './Admin'
import AutoLayout from './AutoLayout'
import Backbone from './Backbone'
import Control from './Control'
import Create from './Create'
import Debug from './Debug'
import Filter from './Filter'
import GlobalUI, {
  Search, CreateMap, ImportDialog, Account as GlobalUI_Account
} from './GlobalUI'
import Import from './Import'
import JIT from './JIT'
import Listeners from './Listeners'
import Map, { CheatSheet, InfoBox } from './Map'
import Mapper from './Mapper'
import Mobile from './Mobile'
import Mouse from './Mouse'
import Organize from './Organize'
import PasteInput from './PasteInput'
import Realtime from './Realtime'
import Router from './Router'
import Selected from './Selected'
import Settings from './Settings'
import Synapse from './Synapse'
import SynapseCard from './SynapseCard'
import Topic from './Topic'
import TopicCard from './TopicCard'
import Util from './Util'
import Views from './Views'
import Visualize from './Visualize'

Metamaps = window.Metamaps || {}
Metamaps.Account = Account
Metamaps.Active = Active
Metamaps.Admin = Admin
Metamaps.AutoLayout = AutoLayout
Metamaps.Backbone = Backbone
Metamaps.Control = Control
Metamaps.Create = Create
Metamaps.Debug = Debug
Metamaps.Filter = Filter
Metamaps.GlobalUI = GlobalUI
Metamaps.GlobalUI.Search = Search
Metamaps.GlobalUI.CreateMap = CreateMap
Metamaps.GlobalUI.Account = GlobalUI_Account
Metamaps.GlobalUI.ImportDialog = ImportDialog
Metamaps.Import = Import
Metamaps.JIT = JIT
Metamaps.Listeners = Listeners
Metamaps.Map = Map
Metamaps.Map.CheatSheet = CheatSheet
Metamaps.Map.InfoBox = InfoBox
Metamaps.Maps = {}
Metamaps.Mapper = Mapper
Metamaps.Mobile = Mobile
Metamaps.Mouse = Mouse
Metamaps.Organize = Organize
Metamaps.PasteInput = PasteInput
Metamaps.Realtime = Realtime
Metamaps.Router = Router
Metamaps.Selected = Selected
Metamaps.Settings = Settings
Metamaps.Synapse = Synapse
Metamaps.SynapseCard = SynapseCard
Metamaps.Topic = Topic
Metamaps.TopicCard = TopicCard
Metamaps.Util = Util
Metamaps.Views = Views
Metamaps.Visualize = Visualize

document.addEventListener('DOMContentLoaded', function () {
  // initialize all the modules
  for (const prop in Metamaps) {
    // this runs the init function within each sub-object on the Metamaps one
    if (Metamaps.hasOwnProperty(prop) &&
      Metamaps[prop] != null &&
      Metamaps[prop].hasOwnProperty('init') &&
      typeof (Metamaps[prop].init) === 'function'
    ) {
      Metamaps[prop].init()
    }
  }
  // load whichever page you are on
  if (Metamaps.currentSection === 'explore') {
    const capitalize = Metamaps.currentPage.charAt(0).toUpperCase() + Metamaps.currentPage.slice(1)

    Views.ExploreMaps.setCollection(Metamaps.Maps[capitalize])
    if (Metamaps.currentPage === 'mapper') {
      Views.ExploreMaps.fetchUserThenRender()
    } else {
      Views.ExploreMaps.render()
    }
    GlobalUI.showDiv('#explore')
  } else if (Metamaps.currentSection === '' && Active.Mapper) {
    Views.ExploreMaps.setCollection(Metamaps.Maps.Active)
    Views.ExploreMaps.render()
    GlobalUI.showDiv('#explore')
  } else if (Active.Map || Active.Topic) {
    Metamaps.Loading.show()
    JIT.prepareVizData()
    GlobalUI.showDiv('#infovis')
  }
})

export default Metamaps
