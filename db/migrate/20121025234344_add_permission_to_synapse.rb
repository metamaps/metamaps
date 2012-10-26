class AddPermissionToSynapse < ActiveRecord::Migration
  def self.up
    add_column :synapses, :permission, :text
    add_column :synapses, :weight, :text
    Synapse.update_all ["permission = ?", "commons"]
    Synapse.update_all ["weight = ?", "5"]
  end

  def self.down
    remove_column :synapses, :permission
    remove_column :synapses, :weight
  end
end
