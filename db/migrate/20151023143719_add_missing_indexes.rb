class AddMissingIndexes < ActiveRecord::Migration
  def change
    add_index :topics, :user_id
    add_index :topics, :metacode_id
    add_index :synapses, [:node2_id, :node2_id]
    add_index :synapses, [:node1_id, :node1_id]
    add_index :synapses, :user_id
    add_index :synapses, :node1_id
    add_index :synapses, :node2_id
    add_index :mappings, [:map_id, :topic_id]
    add_index :mappings, [:map_id, :synapse_id]
    add_index :mappings, :map_id
    add_index :mappings, :user_id
    add_index :maps, :user_id
  end
end
