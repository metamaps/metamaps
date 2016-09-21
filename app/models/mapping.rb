class Mapping < ApplicationRecord
  scope :topicmapping, -> { where(mappable_type: :Topic) }
  scope :synapsemapping, -> { where(mappable_type: :Synapse) }

  belongs_to :mappable, polymorphic: true
  belongs_to :map, class_name: 'Map', foreign_key: 'map_id', touch: true
  belongs_to :user

  validates :xloc, presence: true,
                   unless: proc { |m| m.mappable_type == 'Synapse' }
  validates :yloc, presence: true,
                   unless: proc { |m| m.mappable_type == 'Synapse' }
  validates :map, presence: true
  validates :mappable, presence: true

  delegate :name, to: :user, prefix: true

  def user_image
    user.image.url
  end

  def as_json(_options = {})
    super(methods: [:user_name, :user_image])
  end
end
