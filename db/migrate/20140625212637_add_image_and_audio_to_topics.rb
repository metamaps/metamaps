class AddImageAndAudioToTopics < ActiveRecord::Migration
  def self.up
    add_attachment :topics, :image
    add_attachment :topics, :audio
  end

  def self.down
    remove_attachment :topics, :image
    remove_attachment :topics, :audio
  end
end
