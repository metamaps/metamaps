class RenameNode1IdToTopic1IdInSynapses < ActiveRecord::Migration[5.0]
  def change
    rename_column :synapses, :node1_id, :topic1_id
    rename_column :synapses, :node2_id, :topic2_id
  end
end
