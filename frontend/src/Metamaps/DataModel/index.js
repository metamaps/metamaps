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
  Messages: [],
  Metacodes: new MetacodeCollection(),
  Stars: [],
  Synapses: new SynapseCollection(),
  Topics: new TopicCollection(),

  init: function (serverData) {
    var self = DataModel

    if (serverData.Collaborators) self.Collaborators = new MapperCollection(serverData.Collaborators)
    if (serverData.Creators) self.Creators = new MapperCollection(serverData.Creators)
    if (serverData.Mappers) self.Mappers = new MapperCollection(serverData.Mappers)
    if (serverData.Mappings) self.Mappings = new MappingCollection(serverData.Mappings)
    if (serverData.Messages) self.Messages = serverData.Messages
    if (serverData.Metacodes) self.Metacodes = new MetacodeCollection(serverData.Metacodes)
    if (serverData.Stars) self.Stars = serverData.Stars
    if (serverData.Synapses) self.Synapses = new SynapseCollection(serverData.Synapses)
    if (serverData.Topics) self.Topics = new TopicCollection(serverData.Topics)

    self.attachCollectionEvents()
  },

  attachCollectionEvents: function () {
    var self = DataModel
    self.Topics.on('add remove', function (topic) {
      InfoBox.updateNumbers()
      Filter.checkMetacodes()
      Filter.checkMappers()
    })
    self.Synapses.on('add remove', function (synapse) {
      InfoBox.updateNumbers()
      Filter.checkSynapses()
      Filter.checkMappers()
    })
    self.Mappings.on('add remove', function (mapping) {
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
