import Active from './Active'
import AutoLayout from './AutoLayout'
import Cable from './Cable'
import Control from './Control'
import Create from './Create'
import DataFetcher from './DataFetcher'
import DataModel from './DataModel'
import Debug from './Debug'
import Filter from './Filter'
import GlobalUI, {
  Notifications, ReactApp, Search, CreateMap, ImportDialog
} from './GlobalUI'
import Import from './Import'
import JIT from './JIT'
import Listeners from './Listeners'
import Loading from './Loading'
import Map, { InfoBox } from './Map'
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
Metamaps.Active = Active
Metamaps.AutoLayout = AutoLayout
Metamaps.Cable = Cable
Metamaps.Control = Control
Metamaps.Create = Create
Metamaps.DataFetcher = DataFetcher
Metamaps.DataModel = DataModel
Metamaps.Debug = Debug
Metamaps.Filter = Filter
Metamaps.GlobalUI = GlobalUI
Metamaps.GlobalUI.Notifications = Notifications
Metamaps.GlobalUI.ReactApp = ReactApp
Metamaps.GlobalUI.Search = Search
Metamaps.GlobalUI.CreateMap = CreateMap
Metamaps.GlobalUI.ImportDialog = ImportDialog
Metamaps.Import = Import
Metamaps.JIT = JIT
Metamaps.Listeners = Listeners
Metamaps.Loading = Loading
Metamaps.Map = Map
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

function runInitFunctions(serverData) {
  // initialize all the modules
  for (const prop in Metamaps) {
    // this runs the init function within each sub-object on the Metamaps one
    if (Metamaps.hasOwnProperty(prop) &&
      Metamaps[prop] != null &&
      Metamaps[prop].hasOwnProperty('init') &&
      typeof (Metamaps[prop].init) === 'function'
    ) {
      Metamaps[prop].init(serverData)
    }
  }
}

// fetch data from API then pass into init functions
document.addEventListener('DOMContentLoaded', async function() {
  Metamaps.ServerData = Metamaps.ServerData || {}
  try {
    // TODO: do these in parallel (Promise.all)
    const metacodes = await DataFetcher.getMetacodes()
    Metamaps.ServerData.Metacodes = metacodes

    const metacodeSets = await DataFetcher.getMetacodeSets()
    Metamaps.ServerData.metacodeSets = metacodeSets

    const activeMapper = await DataFetcher.getCurrentUser()
    if (activeMapper) {
      Metamaps.ServerData.ActiveMapper = activeMapper
      $('body').removeClass('unauthenticated').addClass('authenticated')
    }
    runInitFunctions(Metamaps.ServerData)
  } catch (e) {
    console.log(e)
  }
})

export default Metamaps
