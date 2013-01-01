class Mapping < ActiveRecord::Base

belongs_to :topic, :class_name => "Topic", :foreign_key => "topic_id"
belongs_to :synapse, :class_name => "Synapse", :foreign_key => "synapse_id"
belongs_to :map, :class_name => "Map", :foreign_key => "map_id"

belongs_to :user
end
