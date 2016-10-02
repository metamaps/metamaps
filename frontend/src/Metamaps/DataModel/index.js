/* global Metamaps */

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

/*
 * DataModel.js
 *
 * Dependencies:
 *  - Metamaps.Collaborators
 *  - Metamaps.Creators
 *  - Metamaps.Mappers
 *  - Metamaps.Mappings
 *  - Metamaps.Metacodes
 *  - Metamaps.Synapses
 *  - Metamaps.Topics
 */

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

  init: function () {
    var self = DataModel

    Metamaps.Metacodes = Metamaps.Metacodes ? new self.MetacodeCollection(Metamaps.Metacodes) : new self.MetacodeCollection()

    // attach collection event listeners
    Metamaps.Topics = Metamaps.Topics ? new self.TopicCollection(Metamaps.Topics) : new self.TopicCollection()
    Metamaps.Topics.on('add remove', function (topic) {
      InfoBox.updateNumbers()
      Filter.checkMetacodes()
      Filter.checkMappers()
    })

    Metamaps.Synapses = Metamaps.Synapses ? new self.SynapseCollection(Metamaps.Synapses) : new self.SynapseCollection()
    Metamaps.Synapses.on('add remove', function (synapse) {
      InfoBox.updateNumbers()
      Filter.checkSynapses()
      Filter.checkMappers()
    })

    if (Active.Map) {
      Metamaps.Mappings = Metamaps.Mappings ? new self.MappingCollection(Metamaps.Mappings) : new self.MappingCollection()
      Metamaps.Mappings.on('add remove', function (mapping) {
        InfoBox.updateNumbers()
        Filter.checkSynapses()
        Filter.checkMetacodes()
        Filter.checkMappers()
      })
    }

    Metamaps.Mappers = Metamaps.Mappers ? new self.MapperCollection(Metamaps.Mappers) : new self.MapperCollection()
    Metamaps.Collaborators = Metamaps.Collaborators ? new self.MapperCollection(Metamaps.Collaborators) : new self.MapperCollection()
    Metamaps.Creators = Metamaps.Creators ? new self.MapperCollection(Metamaps.Creators) : new self.MapperCollection()

    if (Active.Map) {
      Active.Map = new self.Map(Active.Map)
    }

    if (Active.Topic) {
      Active.Topic = new self.Topic(Active.Topic)
    }
  }
}

export { Map, MapCollection, Mapper, MapperCollection, Mapping, MappingCollection, Message, MessageCollection, Metacode, MetacodeCollection, Synapse, SynapseCollection, Topic, TopicCollection }

export default DataModel
