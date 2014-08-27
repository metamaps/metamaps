class Map < ActiveRecord::Base

  belongs_to :user

  has_many :topicmappings, :class_name => 'Mapping', :conditions => {:category => 'Topic'}
  has_many :synapsemappings, :class_name => 'Mapping', :conditions => {:category => 'Synapse'}

  has_many :topics, :through => :topicmappings
  has_many :synapses, :through => :synapsemappings

  # This method associates the attribute ":image" with a file attachment
  has_attached_file :screenshot, :styles => {
   :thumb => ['188x126#', :png],
   :full => ['1880x1260#', :png]
  }
    
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

  def created_at_str
    self.created_at.strftime("%m/%d/%Y")
  end

  def updated_at_str
    self.updated_at.strftime("%m/%d/%Y")
  end

  def as_json(options={})
    json = super(:methods =>[:user_name, :user_image, :topic_count, :synapse_count, :contributor_count], :except => [:created_at, :updated_at])
    json[:created_at] = self.created_at_str
    json[:updated_at] = self.updated_at_str
    json
  end
  
  ##### PERMISSIONS ######
  
  # returns false if user not allowed to 'show' Topic, Synapse, or Map
  def authorize_to_show(user)  
  	if (self.permission == "private" && self.user != user)
  		return false
  	end
  	return self
  end
  
  # returns false if user not allowed to 'edit' Topic, Synapse, or Map
  def authorize_to_edit(user)  
  	if (self.permission == "private" && self.user != user)
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

end
