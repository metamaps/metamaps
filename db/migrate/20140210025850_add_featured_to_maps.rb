class AddFeaturedToMaps < ActiveRecord::Migration
  def change
    add_column :maps, :featured, :boolean
    Map.reset_column_information
    Map.update_all(:featured => false)
  end
end
