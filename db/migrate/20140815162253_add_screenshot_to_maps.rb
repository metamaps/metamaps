class AddScreenshotToMaps < ActiveRecord::Migration
  def self.up
    add_attachment :maps, :screenshot
  end

  def self.down
    remove_attachment :maps, :screenshot
  end
end
