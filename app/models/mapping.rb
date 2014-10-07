class Mapping < ActiveRecord::Base

  belongs_to :topic, :class_name => "Topic", :foreign_key => "topic_id"
  belongs_to :synapse, :class_name => "Synapse", :foreign_key => "synapse_id"
  belongs_to :map, :class_name => "Map", :foreign_key => "map_id"

  belongs_to :user
  
  def user_name
    self.user.name
  end

  def user_image
    self.user.image.url
  end

  def as_json(options={})
    super(:methods =>[:user_name, :user_image])
  end
  
end
