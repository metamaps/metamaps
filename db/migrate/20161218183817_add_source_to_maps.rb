class AddSourceToMaps < ActiveRecord::Migration[5.0]
  def change
    add_reference :maps, :source, foreign_key: {to_table: :maps}
  end
end
