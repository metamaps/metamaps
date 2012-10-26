class AddPermissionToItem < ActiveRecord::Migration
  def self.up
    add_column :items, :permission, :text
    Item.update_all ["permission = ?", "commons"]
  end

  def self.down
    remove_column :items, :permission
  end
end
