class Map < ApplicationRecord
  belongs_to :user

  has_many :topicmappings, -> { Mapping.topicmapping }, class_name: :Mapping, dependent: :destroy
  has_many :synapsemappings, -> { Mapping.synapsemapping }, class_name: :Mapping, dependent: :destroy
  has_many :topics, through: :topicmappings, source: :mappable, source_type: 'Topic'
  has_many :synapses, through: :synapsemappings, source: :mappable, source_type: 'Synapse'
  has_many :messages, as: :resource, dependent: :destroy
  has_many :stars

  has_many :user_maps, dependent: :destroy
  has_many :collaborators, through: :user_maps, source: :user

  has_many :webhooks, as: :hookable
  has_many :events, -> { includes :user }, as: :eventable, dependent: :destroy

  # This method associates the attribute ":image" with a file attachment
  has_attached_file :screenshot, styles: {
    thumb: ['188x126#', :png]
    #:full => ['940x630#', :png]
  },
  default_url: 'https://s3.amazonaws.com/metamaps-assets/site/missing-map-white.png'

  validates :name, presence: true
  validates :arranged, inclusion: { in: [true, false] }
  validates :permission, presence: true
  validates :permission, inclusion: { in: Perm::ISSIONS.map(&:to_s) }

  # Validate the attached image is image/jpg, image/png, etc
  validates_attachment_content_type :screenshot, content_type: /\Aimage\/.*\Z/

  def mappings
    topicmappings + synapsemappings
  end

  def mk_permission
    Perm.short(permission)
  end

  # return an array of the contributors to the map
  def contributors
    contributors = []

    mappings.each do |m|
      contributors.push(m.user) unless contributors.include?(m.user)
    end

    contributors
  end

  def editors
    collaborators + [user]
  end

  def topic_count
    topics.length
  end

  def synapse_count
    synapses.length
  end

  delegate :name, to: :user, prefix: true

  def user_image
    user.image.url
  end

  def contributor_count
    contributors.length
  end

  def collaborator_ids
    collaborators.map(&:id)
  end

  def screenshot_url
    screenshot.url(:thumb)
  end

  def created_at_str
    created_at.strftime('%m/%d/%Y')
  end

  def updated_at_str
    updated_at.strftime('%m/%d/%Y')
  end

  def as_json(_options = {})
    json = super(methods: [:user_name, :user_image, :topic_count, :synapse_count, :contributor_count, :collaborator_ids, :screenshot_url], except: [:screenshot_content_type, :screenshot_file_size, :screenshot_file_name, :screenshot_updated_at])
    json[:created_at_clean] = created_at_str
    json[:updated_at_clean] = updated_at_str
    json
  end

  def decode_base64(imgBase64)
    decoded_data = Base64.decode64(imgBase64)

    data = StringIO.new(decoded_data)
    data.class_eval do
      attr_accessor :content_type, :original_filename
    end

    data.content_type = 'image/png'
    data.original_filename = File.basename('map-' + id.to_s + '-screenshot.png')

    self.screenshot = data
    save
  end
end
