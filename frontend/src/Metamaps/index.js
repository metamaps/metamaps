import Account from './Account'
import Active from './Active'
import Admin from './Admin'
import AutoLayout from './AutoLayout'
import Cable from './Cable'
import Control from './Control'
import Create from './Create'
import DataModel from './DataModel'
import Debug from './Debug'
import Filter from './Filter'
import GlobalUI, {
  ReactApp, Search, CreateMap, ImportDialog
} from './GlobalUI'
import Import from './Import'
import JIT from './JIT'
import Listeners from './Listeners'
import Loading from './Loading'
import Map, { CheatSheet, InfoBox } from './Map'
import Mapper from './Mapper'
import Mouse from './Mouse'
import Organize from './Organize'
import PasteInput from './PasteInput'
import Realtime from './Realtime'
import Selected from './Selected'
import Settings from './Settings'
import Synapse from './Synapse'
import SynapseCard from './SynapseCard'
import Topic from './Topic'
import Util from './Util'
import Views from './Views'
import Visualize from './Visualize'

const Metamaps = window.Metamaps || {}
Metamaps.Account = Account
Metamaps.Active = Active
Metamaps.Admin = Admin
Metamaps.AutoLayout = AutoLayout
Metamaps.Cable = Cable
Metamaps.Control = Control
Metamaps.Create = Create
Metamaps.DataModel = DataModel
Metamaps.Debug = Debug
Metamaps.Filter = Filter
Metamaps.GlobalUI = GlobalUI
Metamaps.GlobalUI.ReactApp = ReactApp
Metamaps.GlobalUI.Search = Search
Metamaps.GlobalUI.CreateMap = CreateMap
Metamaps.GlobalUI.ImportDialog = ImportDialog
Metamaps.Import = Import
Metamaps.JIT = JIT
Metamaps.Listeners = Listeners
Metamaps.Loading = Loading
Metamaps.Map = Map
Metamaps.Map.CheatSheet = CheatSheet
Metamaps.Map.InfoBox = InfoBox
Metamaps.Maps = {}
Metamaps.Mapper = Mapper
Metamaps.Mouse = Mouse
Metamaps.Organize = Organize
Metamaps.PasteInput = PasteInput
Metamaps.Realtime = Realtime
Metamaps.Selected = Selected
Metamaps.Settings = Settings
Metamaps.Synapse = Synapse
Metamaps.SynapseCard = SynapseCard
Metamaps.Topic = Topic
Metamaps.Util = Util
Metamaps.Views = Views
Metamaps.Visualize = Visualize

document.addEventListener('DOMContentLoaded', function() {
  // initialize all the modules
  for (const prop in Metamaps) {
    // this runs the init function within each sub-object on the Metamaps one
    if (Metamaps.hasOwnProperty(prop) &&
      Metamaps[prop] != null &&
      Metamaps[prop].hasOwnProperty('init') &&
      typeof (Metamaps[prop].init) === 'function'
    ) {
      Metamaps[prop].init(Metamaps.ServerData)
    }
  }
})

export default Metamaps
