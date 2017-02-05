# frozen_string_literal: true
class Synapse < ApplicationRecord
  belongs_to :user
  belongs_to :defer_to_map, class_name: 'Map', foreign_key: 'defer_to_map_id'

  belongs_to :topic1, class_name: 'Topic', foreign_key: 'topic1_id'
  belongs_to :topic2, class_name: 'Topic', foreign_key: 'topic2_id'

  has_many :mappings, as: :mappable, dependent: :destroy
  has_many :maps, through: :mappings

  validates :desc, length: { minimum: 0, allow_nil: false }

  validates :permission, presence: true
  validates :topic1_id, presence: true
  validates :topic2_id, presence: true
  validates :permission, inclusion: { in: Perm::ISSIONS.map(&:to_s) }

  validates :category, inclusion: { in: ['from-to', 'both'], allow_nil: true }

  scope :for_topic, ->(topic_id = nil) {
    where(topic1_id: topic_id).or(where(topic2_id: topic_id))
  }

  before_create :set_perm_by_defer
  after_update :after_updated

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

  def filtered
    {
      id: id,
      permission: permission,
      user_id: user_id,
      collaborator_ids: collaborator_ids
    }
  end

  def as_json(_options = {})
    super(methods: [:user_name, :user_image, :collaborator_ids])
  end

  def as_rdf
    output = ''
    output += %(d:synapse_#{id} a mm:Synapse ;\n)
    output += %(  mm:topic1 d:topic_#{topic1_id} ;\n)
    output += %(  mm:topic2 d:topic_#{topic2_id} ;\n)
    output += %(  mm:direction "#{category}" ;\n)
    output += %(  rdfs:comment "#{desc}" ;\n) if desc.present?
    output[-2] = '.'
    output += %(\n)
    output
  end
  
  protected
  
  def set_perm_by_defer
    permission = defer_to_map.permission if defer_to_map
  end

  def after_updated
    attrs = %w(desc category permission defer_to_map_id)
    if attrs.any? { |k| changed_attributes.key?(k) }
      new = attributes.select { |k| attrs.include?(k) }
      old = changed_attributes.select { |k| attrs.include?(k) }
      meta = new.merge(old) # we are prioritizing the old values, keeping them
      meta['changed'] = changed_attributes.keys.select { |k| attrs.include?(k) }
      Events::SynapseUpdated.publish!(self, user, meta)
      maps.each do |map|
        ActionCable.server.broadcast 'map_' + map.id.to_s, type: 'synapseUpdated', id: id
      end
    end
  end
end
