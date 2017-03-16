import Active from '../Active'
import Filter from '../Filter'
import { InfoBox } from '../Map'

import Map from './Map'
import MapCollection from './MapCollection'
import Message from './Message'
import MessageCollection from './MessageCollection'
import Mapper from './Mapper'
import MapperCollection from './MapperCollection'
import Metacode from './Metacode'
import MetacodeCollection from './MetacodeCollection'
import Topic from './Topic'
import TopicCollection from './TopicCollection'
import Synapse from './Synapse'
import SynapseCollection from './SynapseCollection'
import Mapping from './Mapping'
import MappingCollection from './MappingCollection'

const DataModel = {
  Map: Map,
  MapCollection: MapCollection,
  Message: Message,
  MessageCollection: MessageCollection,
  Mapper: Mapper,
  MapperCollection: MapperCollection,
  Metacode: Metacode,
  MetacodeCollection: MetacodeCollection,
  Topic: Topic,
  TopicCollection: TopicCollection,
  Synapse: Synapse,
  SynapseCollection: SynapseCollection,
  Mapping: Mapping,
  MappingCollection: MappingCollection,

  Collaborators: new MapperCollection(),
  Creators: new MapperCollection(),
  Mappers: new MapperCollection(),
  Mappings: new MappingCollection(),
  Maps: {
    Mine: [],
    Shared: [],
    Starred: [],
    Mapper: {
      models: [],
      mapperId: null
    },
    Featured: [],
    Active: []
  },
  Messages: [],
  Metacodes: new MetacodeCollection(),
  Stars: [],
  Synapses: new SynapseCollection(),
  Topics: new TopicCollection(),

  init: function(serverData) {
    var self = DataModel

    // workaround circular import problem
    if (!self.MapCollection.model) self.MapCollection.model = Map

    self.synapseIconUrl = serverData['synapse16.png']

    if (serverData.ActiveMap) Active.Map = new Map(serverData.ActiveMap)
    if (serverData.ActiveMapper) Active.Mapper = new Mapper(serverData.ActiveMapper)
    if (serverData.ActiveTopic) Active.Topic = new Topic(serverData.ActiveTopic)

    if (serverData.Collaborators) self.Collaborators = new MapperCollection(serverData.Collaborators)
    if (serverData.Creators) self.Creators = new MapperCollection(serverData.Creators)
    if (serverData.Mappers) self.Mappers = new MapperCollection(serverData.Mappers)
    if (serverData.Mappings) self.Mappings = new MappingCollection(serverData.Mappings)
    if (serverData.Messages) self.Messages = serverData.Messages
    if (serverData.Metacodes) self.Metacodes = new MetacodeCollection(serverData.Metacodes)
    if (serverData.Stars) self.Stars = serverData.Stars
    if (serverData.Synapses) self.Synapses = new SynapseCollection(serverData.Synapses)
    if (serverData.Topics) self.Topics = new TopicCollection(serverData.Topics)

    // initialize global backbone models and collections
    var myCollection = serverData.Mine ? serverData.Mine : []
    var sharedCollection = serverData.Shared ? serverData.Shared : []
    var starredCollection = serverData.Starred ? serverData.Starred : []
    var mapperCollection = serverData.Mapper ? serverData.Mapper : []
    var mapperOptionsObj = { id: 'mapper', sortBy: 'updated_at' }
    if (serverData.Mapper && serverData.Mapper.mapperId) {
      mapperCollection = serverData.Mapper.models
      mapperOptionsObj.mapperId = serverData.Mapper.mapperId
    }
    var featuredCollection = serverData.Featured ? serverData.Featured : []
    var activeCollection = serverData.Active ? serverData.Active : []

    self.Maps.Mine = new MapCollection(myCollection, { id: 'mine', sortBy: 'updated_at' })
    self.Maps.Shared = new MapCollection(sharedCollection, { id: 'shared', sortBy: 'updated_at' })
    self.Maps.Starred = new MapCollection(starredCollection, { id: 'starred', sortBy: 'updated_at' })
    // 'Mapper' refers to another mapper
    self.Maps.Mapper = new MapCollection(mapperCollection, mapperOptionsObj)
    self.Maps.Featured = new MapCollection(featuredCollection, { id: 'featured', sortBy: 'updated_at' })
    self.Maps.Active = new MapCollection(activeCollection, { id: 'active', sortBy: 'updated_at' })

    self.attachCollectionEvents()
  },
  attachCollectionEvents: function() {
    DataModel.Topics.on('add remove', function(topic) {
      console.log('updating infobox and filters due to topic add or remove')
      InfoBox.updateNumbers()
      Filter.checkMetacodes()
      Filter.checkMappers()
    })
    DataModel.Synapses.on('add remove', function(synapse) {
      console.log('updating infobox and filters due to synapse add or remove')
      InfoBox.updateNumbers()
      Filter.checkSynapses()
      Filter.checkMappers()
    })
    DataModel.Mappings.on('add remove', function(mapping) {
      console.log('updating infobox and filters due to mapping add or remove')
      InfoBox.updateNumbers()
      Filter.checkSynapses()
      Filter.checkMetacodes()
      Filter.checkMappers()
    })
  }
}

// Note: Topics, Metacodes, Synapses, Mappers, Mappings, Collaborators, Creators are not exported
// You can access them by importing DataModel

export { Map, MapCollection, Mapper, MapperCollection, Mapping, MappingCollection, Message, MessageCollection, Metacode, MetacodeCollection, Synapse, SynapseCollection, Topic, TopicCollection }

export default DataModel
