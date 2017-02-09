class AddUpdatedByToTopicsSynapsesAndMaps < ActiveRecord::Migration[5.0]
  def change
    add_reference :topics, :updated_by, foreign_key: {to_table: :users}
    add_reference :synapses, :updated_by, foreign_key: {to_table: :users}
    add_reference :maps, :updated_by, foreign_key: {to_table: :users}
  end
end
