class Map < ActiveRecord::Base

  belongs_to :user

  has_many :topicmappings, :class_name => 'Mapping', :conditions => {:category => 'Topic'}
  has_many :synapsemappings, :class_name => 'Mapping', :conditions => {:category => 'Synapse'}

  has_many :topics, :through => :topicmappings
  has_many :synapses, :through => :synapsemappings

  # This method associates the attribute ":image" with a file attachment
  has_attached_file :screenshot, :styles => {
   :thumb => ['188x126#', :png]
   #:full => ['940x630#', :png]
  },
  :default_url => "/assets/missing-map.png"
    
  # Validate the attached image is image/jpg, image/png, etc
  validates_attachment_content_type :screenshot, :content_type => /\Aimage\/.*\Z/

  def mappings 
  	topicmappings + synapsemappings
  end

  def mk_permission
    if self.permission == "commons"
      "co"
    elsif self.permission == "public"
      "pu"
    elsif self.permission == "private"
      "pr"
    end
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
    self.topics.length
  end

  def synapse_count
    self.synapses.length
  end

  def user_name
    self.user.name
  end

  def user_image
    self.user.image.url
  end

  def contributor_count 
    self.contributors.length
  end

  def screenshot_url
    self.screenshot.url(:thumb)
  end

  def created_at_str
    self.created_at.strftime("%m/%d/%Y")
  end

  def updated_at_str
    self.updated_at.strftime("%m/%d/%Y")
  end

  def as_json(options={})
    json = super(:methods =>[:user_name, :user_image, :topic_count, :synapse_count, :contributor_count, :screenshot_url], :except => [:screenshot_content_type, :screenshot_file_size, :screenshot_file_name, :screenshot_updated_at])
    json[:created_at_clean] = self.created_at_str
    json[:updated_at_clean] = self.updated_at_str
    json
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
  
  # returns Boolean if user allowed to view Topic, Synapse, or Map
  def authorize_to_view(user)  
  	if (self.permission == "private" && self.user != user)
  		return false
  	end
  	return true
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
