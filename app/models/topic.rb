# frozen_string_literal: true
class Topic < ApplicationRecord
  include TopicsHelper

  belongs_to :user
  belongs_to :defer_to_map, class_name: 'Map', foreign_key: 'defer_to_map_id'

  has_many :synapses1, class_name: 'Synapse', foreign_key: 'topic1_id', dependent: :destroy
  has_many :synapses2, class_name: 'Synapse', foreign_key: 'topic2_id', dependent: :destroy
  has_many :topics1, through: :synapses2, source: :topic1
  has_many :topics2, through: :synapses1, source: :topic2

  has_many :mappings, as: :mappable, dependent: :destroy
  has_many :maps, through: :mappings

  belongs_to :metacode

  before_create :create_metamap?
  after_update :after_updated

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
    synapses1.or(synapses2)
  end

  def relatives
    topics1.or(topics2)
  end

  scope :relatives, ->(topic_id = nil, user = nil) {
    # should only see topics through *visible* synapses
    # e.g. Topic A (commons) -> synapse (private) -> Topic B (commons) must be filtered out
    topic_ids = Pundit.policy_scope(user, Synapse.where(topic1_id: topic_id)).pluck(:topic2_id)
    topic_ids += Pundit.policy_scope(user, Synapse.where(topic2_id: topic_id)).pluck(:topic1_id)
    where(id: topic_ids.uniq)
  }

  delegate :name, to: :user, prefix: true

  def user_image
    user.image.url
  end

  def map_count(user)
    Pundit.policy_scope(user, maps).count
  end

  def synapse_count(user)
    Pundit.policy_scope(user, synapses).count
  end

  def inmaps(user)
    Pundit.policy_scope(user, maps).map(&:name)
  end

  def inmapsLinks(user)
    Pundit.policy_scope(user, maps).map(&:id)
  end

  def as_json(options = {})
    super(methods: [:user_name, :user_image, :collaborator_ids])
      .merge(inmaps: inmaps(options[:user]), inmapsLinks: inmapsLinks(options[:user]),
             map_count: map_count(options[:user]), synapse_count: synapse_count(options[:user]))
  end

  def as_rdf
    output = ''
    output += %(d:topic_#{id} a mm:Topic ;\n)
    output += %(  rdfs:label "#{name}" ;\n)
    output += %(  rdfs:comment "#{desc}" ;\n) if desc.present?
    output += %(  foaf:homepage <#{link}> ;\n) if link.present?
    output += %(  mm:mapper d:mapper_#{user_id} ;\n)
    output += %(  mm:metacode "#{metacode.name}" ;\n)
    output[-2] = '.' # change last ; to a .
    output += %(\n)
    output
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

  # TODO: move to a decorator?
  def synapses_csv(output_format = 'array')
    output = []
    synapses.each do |synapse|
      if synapse.category == 'from-to'
        if synapse.topic1_id == id
          output << synapse.topic1_id.to_s + '->' + synapse.topic2_id.to_s
        elsif synapse.topic2_id == id
          output << synapse.topic2_id.to_s + '<-' + synapse.topic1_id.to_s
        else
          raise 'invalid synapse on topic in synapse_csv'
        end
      elsif synapse.category == 'both'
        if synapse.topic1_id == id
          output << synapse.topic1_id.to_s + '<->' + synapse.topic2_id.to_s
        elsif synapse.topic2_id == id
          output << synapse.topic2_id.to_s + '<->' + synapse.topic1_id.to_s
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

  protected

  def create_metamap?
    return unless (link == '') && (metacode.name == 'Metamap')

    @map = Map.create(name: name, permission: permission, desc: '',
                      arranged: true, user_id: user_id)
    self.link = Rails.application.routes.url_helpers
                     .map_url(host: ENV['MAILER_DEFAULT_URL'], id: @map.id)
  end

  def after_updated
    attrs = %w(name desc link metacode_id permission defer_to_map_id)
    if attrs.any? { |k| changed_attributes.key?(k) }
      new = attributes.select { |k| attrs.include?(k) }
      old = changed_attributes.select { |k| attrs.include?(k) }
      meta = new.merge(old) # we are prioritizing the old values, keeping them
      meta['changed'] = changed_attributes.keys.select { |k| attrs.include?(k) }
      Events::TopicUpdated.publish!(self, user, meta)
      maps.each do |map|
        ActionCable.server.broadcast 'map_' + map.id.to_s, type: 'topicUpdated', id: id
      end
    end
  end
end
