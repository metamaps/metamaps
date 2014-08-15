class Topic < ActiveRecord::Base
  include TopicsHelper

  belongs_to :user

  has_many :synapses1, :class_name => 'Synapse', :foreign_key => 'node1_id'
  has_many :synapses2, :class_name => 'Synapse', :foreign_key => 'node2_id'
  has_many :topics1, :through => :synapses2, :source => :topic1
  has_many :topics2, :through => :synapses1, :source => :topic2

  has_many :mappings
  has_many :maps, :through => :mappings
    
  # This method associates the attribute ":image" with a file attachment
  has_attached_file :image
    
  #, styles: {
  # thumb: '100x100>',
  # square: '200x200#',
  # medium: '300x300>'
  #}

  # Validate the attached image is image/jpg, image/png, etc
  validates_attachment_content_type :image, :content_type => /\Aimage\/.*\Z/
  
  # This method associates the attribute ":image" with a file attachment
  has_attached_file :audio
  # Validate the attached audio is audio/wav, audio/mp3, etc
  validates_attachment_content_type :audio, :content_type => /\Aaudio\/.*\Z/   
    
  def synapses
     synapses1 + synapses2
  end
  
  def relatives
     topics1 + topics2
  end

  belongs_to :metacode

  def user_name
    self.user.name
  end

  def user_image
    self.user.image.url
  end

  def map_count
    self.maps.count
  end

  def synapse_count
    self.synapses.count
  end

  def as_json(options={})
    super(:methods =>[:user_name, :user_image, :map_count, :synapse_count])
  end

  # sends push updates through redis to websockets for realtime updates
  def message action, origin_user_id
  
    return if self.permission == "private" and action == "create"
  
    #get array of all maps topic appears in
    @maps = self.maps
    #sends update to all maps that topic appears in who have realtime on
    @maps.each do |map|
      msg = { origin: origin_user_id,
          mapid: map.id,
          resource: 'Topic',
          action: action,
          id: self.id,
          obj: self.selfonmap_as_json(map.id).html_safe }
      $redis.publish 'maps', msg.to_json
    end 
  end

  def topic_autocomplete_method
    "Get: #{self.name}"
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

  # has no viewable synapses helper function
  def has_viewable_synapses(current)
  	result = false
  	self.synapses.each do |synapse|
  		if synapse.authorize_to_view(current)
  			result = true
  		end
  	end
  	return result
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
