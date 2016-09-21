class Topic < ApplicationRecord
  include TopicsHelper

  belongs_to :user
  belongs_to :defer_to_map, class_name: 'Map', foreign_key: 'defer_to_map_id'

  has_many :synapses1, class_name: 'Synapse', foreign_key: 'node1_id', dependent: :destroy
  has_many :synapses2, class_name: 'Synapse', foreign_key: 'node2_id', dependent: :destroy
  has_many :topics1, through: :synapses2, source: :topic1
  has_many :topics2, through: :synapses1, source: :topic2

  has_many :mappings, as: :mappable, dependent: :destroy
  has_many :maps, through: :mappings

  belongs_to :metacode

  validates :permission, presence: true
  validates :permission, inclusion: { in: Perm::ISSIONS.map(&:to_s) }

  # This method associates the attribute ":image" with a file attachment
  has_attached_file :image

  # , styles: {
  # thumb: '100x100>',
  # square: '200x200#',
  # medium: '300x300>'
  # }

  # Validate the attached image is image/jpg, image/png, etc
  validates_attachment_content_type :image, content_type: /\Aimage\/.*\Z/

  # This method associates the attribute ":image" with a file attachment
  has_attached_file :audio
  # Validate the attached audio is audio/wav, audio/mp3, etc
  validates_attachment_content_type :audio, content_type: /\Aaudio\/.*\Z/

  def synapses
    synapses1 + synapses2
  end

  def relatives
    topics1 + topics2
  end

  scope :relatives, ->(topic_id = nil, user = nil) {
    # should only see topics through *visible* synapses
    # e.g. Topic A (commons) -> synapse (private) -> Topic B (commons) must be filtered out
    synapses = Pundit.policy_scope(user, Synapse.where(node1_id: topic_id)).pluck(:node2_id)
    synapses += Pundit.policy_scope(user, Synapse.where(node2_id: topic_id)).pluck(:node1_id)
    where(id: synapses.uniq)
  }

  delegate :name, to: :user, prefix: true

  def user_image
    user.image.url
  end

  def map_count
    maps.count
  end

  def synapse_count
    synapses.count
  end

  def inmaps
    maps.map(&:name)
  end

  def inmapsLinks
    maps.map(&:id)
  end

  def calculated_permission
    if defer_to_map
      defer_to_map.permission
    else
      permission
    end
  end

  def as_json(_options = {})
    super(methods: [:user_name, :user_image, :map_count, :synapse_count, :inmaps, :inmapsLinks, :calculated_permission, :collaborator_ids])
  end

  def collaborator_ids
    if defer_to_map
      defer_to_map.editors.select { |mapper| mapper != user }.map(&:id)
    else
      []
    end
  end

  # TODO: move to a decorator?
  def synapses_csv(output_format = 'array')
    output = []
    synapses.each do |synapse|
      if synapse.category == 'from-to'
        if synapse.node1_id == id
          output << synapse.node1_id.to_s + '->' + synapse.node2_id.to_s
        elsif synapse.node2_id == id
          output << synapse.node2_id.to_s + '<-' + synapse.node1_id.to_s
        else
          raise 'invalid synapse on topic in synapse_csv'
        end
      elsif synapse.category == 'both'
        if synapse.node1_id == id
          output << synapse.node1_id.to_s + '<->' + synapse.node2_id.to_s
        elsif synapse.node2_id == id
          output << synapse.node2_id.to_s + '<->' + synapse.node1_id.to_s
        else
          raise 'invalid synapse on topic in synapse_csv'
        end
      end
    end
    if output_format == 'array'
      return output
    elsif output_format == 'text'
      return output.join('; ')
    else
      raise 'invalid argument to synapses_csv'
    end
    output
  end

  def topic_autocomplete_method
    "Get: #{name}"
  end

  def mk_permission
    Perm.short(permission)
  end
end
