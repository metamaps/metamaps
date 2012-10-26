class AddAllToMap < ActiveRecord::Migration
  def self.up
    add_column :maps, :name, :text
	add_column :maps, :desc, :text
	add_column :maps, :permission, :text
	add_column :maps, :user_id, :integer
  end
end
