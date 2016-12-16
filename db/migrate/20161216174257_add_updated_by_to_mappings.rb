class AddUpdatedByToMappings < ActiveRecord::Migration[5.0]
  def change
      add_reference :mappings, :updated_by, foreign_key: {to_table: :users}
  end
end
