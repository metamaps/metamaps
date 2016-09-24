# frozen_string_literal: true
class Synapse < ApplicationRecord
  belongs_to :user
  belongs_to :defer_to_map, class_name: 'Map', foreign_key: 'defer_to_map_id'

  belongs_to :topic1, class_name: 'Topic', foreign_key: 'node1_id'
  belongs_to :topic2, class_name: 'Topic', foreign_key: 'node2_id'

  has_many :mappings, as: :mappable, dependent: :destroy
  has_many :maps, through: :mappings

  validates :desc, length: { minimum: 0, allow_nil: false }

  validates :permission, presence: true
  validates :node1_id, presence: true
  validates :node2_id, presence: true
  validates :permission, inclusion: { in: Perm::ISSIONS.map(&:to_s) }

  validates :category, inclusion: { in: ['from-to', 'both'], allow_nil: true }

  scope :for_topic, ->(topic_id = nil) {
    where('node1_id = ? OR node2_id = ?', topic_id, topic_id)
  }

  delegate :name, to: :user, prefix: true

  def user_image
    user.image.url
  end

  def collaborator_ids
    if defer_to_map
      defer_to_map.editors.select { |mapper| mapper != user }.map(&:id)
    else
      []
    end
  end

  def calculated_permission
    defer_to_map&.permission || permission
  end

  def as_json(_options = {})
    super(methods: [:user_name, :user_image, :calculated_permission, :collaborator_ids])
  end
end
