# frozen_string_literal: true
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

  after_create :after_created
  after_update :after_updated
  before_destroy :before_destroyed

  def user_image
    user.image.url
  end

  def as_json(_options = {})
    super(methods: [:user_name, :user_image])
  end

  def after_created
    if mappable_type == 'Topic'
      meta = {'x': xloc, 'y': yloc, 'mapping_id': id}
      Events::TopicAddedToMap.publish!(mappable, map, user, meta)
    elsif mappable_type == 'Synapse'
      Events::SynapseAddedToMap.publish!(mappable, map, user, meta)
    end
  end

  def after_updated
    if mappable_type == 'Topic' and (xloc_changed? or yloc_changed?)
      meta = {'x': xloc, 'y': yloc, 'mapping_id': id}
      Events::TopicMovedOnMap.publish!(mappable, map, user, meta)
    end
  end

  def before_destroyed
    if mappable.defer_to_map
      mappable.permission = mappable.defer_to_map.permission
      mappable.defer_to_map_id = nil
      mappable.save
    end

    meta = {'mapping_id': id}
    if mappable_type == 'Topic'
      Events::TopicRemovedFromMap.publish!(mappable, map, user, meta)
    elsif mappable_type == 'Synapse'
      Events::SynapseRemovedFromMap.publish!(mappable, map, user, meta)
    end
  end
end
