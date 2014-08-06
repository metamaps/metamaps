class AddImageToUsers < ActiveRecord::Migration
  def self.up
    add_attachment :users, :image
  end

  def self.down
    remove_attachment :users, :image
  end
end
