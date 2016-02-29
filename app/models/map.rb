class Map < ActiveRecord::Base

  belongs_to :user

  has_many :topicmappings, -> { Mapping.topicmapping }, class_name: :Mapping, dependent: :destroy
  has_many :synapsemappings, -> { Mapping.synapsemapping }, class_name: :Mapping, dependent: :destroy
  has_many :topics, through: :topicmappings, source: :mappable, source_type: "Topic"
  has_many :synapses, through: :synapsemappings, source: :mappable, source_type: "Synapse"
  has_many :messages, as: :resource, dependent: :destroy

  # This method associates the attribute ":image" with a file attachment
  has_attached_file :screenshot, :styles => {
   :thumb => ['188x126#', :png]
   #:full => ['940x630#', :png]
  },
  :default_url => 'https://s3.amazonaws.com/metamaps-assets/site/missing-map.png'

  validates :name, presence: true
  validates :arranged, inclusion: { in: [true, false] }
  validates :permission, presence: true
  validates :permission, inclusion: { in: Perm::ISSIONS.map(&:to_s) }

  # Validate the attached image is image/jpg, image/png, etc
  validates_attachment_content_type :screenshot, :content_type => /\Aimage\/.*\Z/

  def mappings
  	topicmappings + synapsemappings
  end

  def mk_permission
    Perm.short(permission)
  end

  #return an array of the contributors to the map
  def contributors
    contributors = []

    self.mappings.each do |m|
      contributors.push(m.user) if !contributors.include?(m.user)
    end

    return contributors
  end

  def topic_count
    topics.length
  end

  def synapse_count
    synapses.length
  end

  def user_name
    user.name
  end

  def user_image
    user.image.url
  end

  def contributor_count 
    contributors.length
  end

  def screenshot_url
    screenshot.url(:thumb)
  end

  def created_at_str
    created_at.strftime("%m/%d/%Y")
  end

  def updated_at_str
    updated_at.strftime("%m/%d/%Y")
  end

  def as_json(options={})
    json = super(:methods =>[:user_name, :user_image, :topic_count, :synapse_count, :contributor_count, :screenshot_url], :except => [:screenshot_content_type, :screenshot_file_size, :screenshot_file_name, :screenshot_updated_at])
    json[:created_at_clean] = created_at_str
    json[:updated_at_clean] = updated_at_str
    json
  end

  def to_csv(options = {})
    CSV.generate(options) do |csv|
      csv << ["id", "name", "metacode", "desc", "link", "user.name", "permission", "synapses"]
      self.topics.each do |topic|
        csv << [
          topic.id,
          topic.name,
          topic.metacode.name,
          topic.desc,
          topic.link,
          topic.user.name,
          topic.permission,
          topic.synapses_csv("text")
        ]
      end
    end
  end

  ##### PERMISSIONS ######

  def authorize_to_delete(user)
    if (self.user != user)
      return false
    end
    return self
  end

  # returns false if user not allowed to 'show' Topic, Synapse, or Map
  def authorize_to_show(user)
    if (self.permission == "private" && self.user != user)
  		return false
  	end
  	return self
  end

  # returns false if user not allowed to 'edit' Topic, Synapse, or Map
  def authorize_to_edit(user)
  	if !user
      return false
    elsif (self.permission == "private" && self.user != user)
  		return false
  	elsif (self.permission == "public" && self.user != user)
  		return false
  	end
  	return self
  end

  def decode_base64(imgBase64)
    decoded_data = Base64.decode64(imgBase64)

    data = StringIO.new(decoded_data)
    data.class_eval do
      attr_accessor :content_type, :original_filename
    end

    data.content_type = "image/png"
    data.original_filename = File.basename('map-' + self.id.to_s + '-screenshot.png')

    self.screenshot = data
    self.save
  end

end
