import DataModelMap from './DataModel/Map'
import DataModelMapper from './DataModel/Mapper'
import DataModelTopic from './DataModel/Topic'

const Active = {
  Map: null,
  Mapper: null,
  Topic: null,
  init: function(serverData) {
    if (serverData.Map) Active.Map = new DataModelMap(severData.ActiveMap)
    if (serverData.Mapper) Active.Mapper = new DataModelMapper(serverData.ActiveMapper)
    if (serverData.Topic) Active.Topic = new DataModelTopic(serverData.ActiveTopic)
  }
}

export default Active
