class CreateMapViews < ActiveRecord::Migration
  def change
    create_table :map_views do |t|
      t.references :user
      t.references :map

      t.timestamps
    end
    add_index :map_views, :user_id
    add_index :map_views, :map_id
  end
end
