class ItemsToTopics < ActiveRecord::Migration
  def change
    
    rename_column :items, :item_category_id, :metacode_id
    rename_column :mappings, :item_id, :topic_id
  
    rename_table :items, :topics
    rename_table :item_categories, :metacodes
  end
end
