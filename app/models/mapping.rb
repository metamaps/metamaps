class Mapping < ActiveRecord::Base

belongs_to :topic, :class_name => "Topic", :foreign_key => "topic_id"
belongs_to :synapse, :class_name => "Synapse", :foreign_key => "synapse_id"
belongs_to :map, :class_name => "Map", :foreign_key => "map_id"

belongs_to :user

  # sends push updates through redis to websockets for realtime updates
  def message action, origin_user_id
    if self.category == "Topic"
    
      return if self.topic.permission == "private" and action == "create"
    
      msg = { origin: origin_user_id,
            mapid: self.map.id,
            resource: self.category,
            action: action,
            id: self.topic.id,
            obj: self.topic.selfonmap_as_json(self.map.id).html_safe }
    elsif self.category == "Synapse"
    
      return if self.synapse.permission == "private" and action == "create"
    
      msg = { origin: origin_user_id,
            mapid: self.map.id,
            resource: self.category,
            action: action,
            id: self.synapse.id,
            obj: self.synapse.self_as_json.html_safe }
    end
    $redis.publish 'maps', msg.to_json
  end
  
end
