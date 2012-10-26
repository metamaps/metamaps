class Mapping < ActiveRecord::Base

belongs_to :item, :class_name => "Item", :foreign_key => "item_id"
belongs_to :synapse, :class_name => "Synapse", :foreign_key => "synapse_id"
belongs_to :map, :class_name => "Map", :foreign_key => "map_id"

belongs_to :user
end
