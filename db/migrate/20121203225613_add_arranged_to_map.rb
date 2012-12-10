class AddArrangedToMap < ActiveRecord::Migration
  def change
	add_column :maps, :arranged, :boolean
	Map.update_all ["arranged = ?", false]
  end
end
