class AddDefersToMapToTopicsAndSynapses < ActiveRecord::Migration
  def change
    add_column :topics, :defer_to_map_id, :integer
    add_column :synapses, :defer_to_map_id, :integer
  end
end
