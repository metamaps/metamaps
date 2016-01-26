class Mapping < ActiveRecord::Base

  scope :topicmapping, -> { where(mappable_type: :Topic) }
  scope :synapsemapping, -> { where(mappable_type: :Synapse) }

  belongs_to :mappable, polymorphic: true
  belongs_to :map, :class_name => "Map", :foreign_key => "map_id", touch: true
  belongs_to :user

  validates :xloc, presence: true
  validates :yloc, presence: true
  validates :map, presence: true
  validates :mappable, presence: true
  
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
